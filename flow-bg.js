(function () {
  const canvas = document.querySelector(".flow-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width, height, dpr, nodes, pulseX, speed;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = 4;
    const margin = width / (count + 1);
    nodes = Array.from({ length: count }, (_, i) => ({
      x: margin * (i + 1),
      label: String(i + 1),
      hit: false,
      glow: 0,
    }));
    pulseX = nodes[0].x - 10;
    speed = width / 240;
  }
  resize();
  window.addEventListener("resize", resize);

  function lineY() {
    return height / 2;
  }

  function drawNode(n) {
    const y = lineY();
    ctx.beginPath();
    ctx.fillStyle = "rgba(16,26,48,1)";
    ctx.strokeStyle = `rgba(255,154,92,${0.55 + n.glow * 0.45})`;
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
      ctx.strokeStyle = `rgba(255,154,92,${n.glow * 0.5})`;
      ctx.lineWidth = 1;
      ctx.arc(n.x, y, 16 + (1 - n.glow) * 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);
    const y = lineY();
    const first = nodes[0].x;
    const last = nodes[nodes.length - 1].x;

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.moveTo(first, y);
    ctx.lineTo(last, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,122,48,0.5)";
    ctx.lineWidth = 2;
    ctx.moveTo(first, y);
    ctx.lineTo(Math.min(Math.max(pulseX, first), last), y);
    ctx.stroke();

    pulseX += speed;
    nodes.forEach((n) => {
      if (!n.hit && pulseX >= n.x) {
        n.hit = true;
        n.glow = 1;
      }
      if (n.glow > 0) n.glow = Math.max(0, n.glow - 0.02);
      drawNode(n);
    });

    if (pulseX >= first && pulseX <= last + 20) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(255,154,92,0.95)";
      ctx.shadowColor = "rgba(255,122,48,0.8)";
      ctx.shadowBlur = 8;
      ctx.arc(pulseX, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (pulseX > last + 20) {
      pulseX = first - 10;
      nodes.forEach((n) => (n.hit = false));
    }

    if (!reduceMotion) requestAnimationFrame(step);
  }

  step();
})();
