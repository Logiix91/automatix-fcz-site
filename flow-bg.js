(function () {
  const canvas = document.querySelector(".flow-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ACCENTS = {
    default: { light: "255,154,92", mid: "255,122,48" },
    violet: { light: "186,180,255", mid: "150,142,255" },
    cyan: { light: "103,212,247", mid: "56,189,248" },
  };
  const accent = ACCENTS[canvas.dataset.variant] || ACCENTS.default;

  let width, height, dpr, nodes, branches, pulseX, speed, trail, wavePhase, cycles;

  function waveY(baseY, x, first, last, phase) {
    const span = last - first || 1;
    return baseY + Math.sin(((x - first) / span) * Math.PI * 2 + phase) * 7;
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = 6;
    const margin = width / (count + 1);
    nodes = Array.from({ length: count }, (_, i) => ({
      x: margin * (i + 1),
      label: String(i + 1),
      hit: false,
      glow: 0,
    }));

    branches = [];
    for (let i = 0; i < count - 1; i++) {
      const midX = (nodes[i].x + nodes[i + 1].x) / 2;
      branches.push({ x: midX, side: i % 2 === 0 ? -1 : 1, glow: 0, hit: false, triggerX: midX });
    }

    pulseX = nodes[0].x - 10;
    speed = width / 240;
    trail = [];
    wavePhase = 0;
    cycles = 0;
  }
  resize();
  window.addEventListener("resize", resize);

  function lineY() {
    return height / 2;
  }

  function drawNode(n, y) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(16,26,48,1)";
    ctx.strokeStyle = `rgba(${accent.light},${0.55 + n.glow * 0.45})`;
    ctx.lineWidth = 1.5 + n.glow * 1.5;
    ctx.arc(n.x, y, 9 + n.glow * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(n.label, n.x, y);

    if (n.glow > 0) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${accent.light},${n.glow * 0.5})`;
      ctx.lineWidth = 1;
      ctx.arc(n.x, y, 16 + (1 - n.glow) * 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawBranch(b, mainY) {
    const by = mainY + b.side * 22;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,255,255,${0.1 + b.glow * 0.15})`;
    ctx.lineWidth = 1;
    ctx.moveTo(b.x, mainY);
    ctx.quadraticCurveTo(b.x + b.side * 4, mainY + (b.side * 22) / 2, b.x, by);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "rgba(16,26,48,1)";
    ctx.strokeStyle = `rgba(56,189,248,${0.5 + b.glow * 0.5})`;
    ctx.lineWidth = 1.2 + b.glow * 1.2;
    ctx.arc(b.x, by, 4.5 + b.glow * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (b.glow > 0) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(56,189,248,${b.glow * 0.45})`;
      ctx.lineWidth = 1;
      ctx.arc(b.x, by, 8 + (1 - b.glow) * 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);
    const baseY = lineY();
    const first = nodes[0].x;
    const last = nodes[nodes.length - 1].x;
    wavePhase += 0.012;

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    for (let x = first; x <= last; x += 4) {
      const y = waveY(baseY, x, first, last, wavePhase);
      if (x === first) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = `rgba(${accent.mid},0.55)`;
    ctx.lineWidth = 2;
    const litEnd = Math.min(Math.max(pulseX, first), last);
    for (let x = first; x <= litEnd; x += 4) {
      const y = waveY(baseY, x, first, last, wavePhase);
      if (x === first) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    branches.forEach((b) => drawBranch(b, waveY(baseY, b.x, first, last, wavePhase)));

    pulseX += speed;
    const pulseY = waveY(baseY, Math.min(Math.max(pulseX, first), last), first, last, wavePhase);

    trail.push({ x: pulseX, y: pulseY, life: 1 });
    trail.forEach((t) => (t.life -= 0.07));
    trail = trail.filter((t) => t.life > 0);
    trail.forEach((t) => {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${accent.light},${t.life * 0.6})`;
      ctx.arc(t.x, t.y, 2.5 * t.life, 0, Math.PI * 2);
      ctx.fill();
    });

    nodes.forEach((n) => {
      if (!n.hit && pulseX >= n.x) {
        n.hit = true;
        n.glow = 1;
      }
      if (n.glow > 0) n.glow = Math.max(0, n.glow - 0.02);
      drawNode(n, waveY(baseY, n.x, first, last, wavePhase));
    });

    branches.forEach((b) => {
      if (!b.hit && pulseX >= b.triggerX) {
        b.hit = true;
        b.glow = 1;
      }
      if (b.glow > 0) b.glow = Math.max(0, b.glow - 0.018);
    });

    if (pulseX >= first && pulseX <= last + 20) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${accent.light},0.95)`;
      ctx.shadowColor = `rgba(${accent.mid},0.8)`;
      ctx.shadowBlur = 8;
      ctx.arc(pulseX, pulseY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (pulseX > last + 20) {
      pulseX = first - 10;
      cycles += 1;
      nodes.forEach((n) => (n.hit = false));
      branches.forEach((b) => (b.hit = false));
    }

    if (!reduceMotion) requestAnimationFrame(step);
  }

  step();
})();
