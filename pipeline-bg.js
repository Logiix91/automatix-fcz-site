(function () {
  const canvas = document.querySelector(".pipeline-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const PALETTE = [
    { fill: "rgba(11,17,32,0.88)", stroke: "rgba(255,154,92,0.8)" },
    { fill: "rgba(11,17,32,0.88)", stroke: "rgba(56,189,248,0.8)" },
    { fill: "rgba(11,17,32,0.88)", stroke: "rgba(52,211,153,0.8)" },
    { fill: "rgba(11,17,32,0.88)", stroke: "rgba(168,162,255,0.8)" },
  ];

  let width, height, dpr, gears, boxes, popups, binCount, binPulse, dots, scanX;

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
    gears = makeGears();
    boxes = makeBoxes();
    popups = [];
    binCount = 0;
    binPulse = 0;
    scanX = -0.2;
    dots = makeDots();
  }

  function beltY() {
    return height * 0.42;
  }

  function binPos() {
    return { x: width - 26, y: height - 20 };
  }

  function makeGears() {
    const count = Math.max(3, Math.min(5, Math.round(width / 170)));
    const margin = (width - 50) / (count + 1);
    return Array.from({ length: count }, (_, i) => ({
      x: margin * (i + 1) + 10,
      r: 14,
      rotation: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.012,
    }));
  }

  function makeDots() {
    const cols = Math.ceil(width / 22);
    const rows = Math.ceil(height / 22);
    const out = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push({ x: c * 22, y: r * 22 });
      }
    }
    return out;
  }

  function makeBoxes() {
    const count = 6;
    return Array.from({ length: count }, (_, i) => ({
      x: (width / count) * i - 20,
      size: 14 + Math.random() * 5,
      speed: 0.5 + Math.random() * 0.18,
      bob: Math.random() * Math.PI * 2,
      lastStation: -1,
      palette: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      diverting: false,
      divertT: 0,
      fromX: 0, fromY: 0,
    }));
  }

  resize();
  window.addEventListener("resize", resize);

  function drawGear(g) {
    ctx.save();
    ctx.translate(g.x, beltY() - 2);
    ctx.rotate(g.rotation);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(100,116,139,0.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, g.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const teeth = 8;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = "rgba(100,116,139,0.55)";
      ctx.fillRect(-2, -g.r - 4, 4, 6);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,122,48,0.9)";
    ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBox(b, y, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(b.x, y);
    ctx.fillStyle = b.palette.fill;
    ctx.strokeStyle = b.palette.stroke;
    ctx.lineWidth = 1.3;
    ctx.fillRect(-b.size / 2, -b.size / 2, b.size, b.size);
    ctx.strokeRect(-b.size / 2, -b.size / 2, b.size, b.size);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.moveTo(-b.size / 2, -1);
    ctx.lineTo(b.size / 2, -1);
    ctx.stroke();
    ctx.restore();
  }

  function drawCheck(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.strokeStyle = "rgba(255,122,48,0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-1.5, 4);
    ctx.lineTo(5, -5);
    ctx.stroke();
    ctx.restore();
  }

  function drawBin() {
    const p = binPos();
    const pulse = binPulse;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.strokeStyle = `rgba(255,154,92,${0.5 + pulse * 0.4})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-13, -16);
    ctx.lineTo(13, -16);
    ctx.lineTo(11, 8);
    ctx.lineTo(-11, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "9px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(binCount), 0, -3);
    ctx.restore();
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "rgba(148,163,184,0.18)";
    dots.forEach((d) => ctx.fillRect(d.x, d.y, 1.4, 1.4));

    scanX += width / 5000;
    if (scanX > 1.3) scanX = -0.3;
    const sx = scanX * width;
    const grad = ctx.createLinearGradient(sx - 40, 0, sx + 40, 0);
    grad.addColorStop(0, "rgba(255,154,92,0)");
    grad.addColorStop(0.5, "rgba(255,154,92,0.07)");
    grad.addColorStop(1, "rgba(255,154,92,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.strokeStyle = "rgba(148,163,184,0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.moveTo(8, beltY());
    ctx.lineTo(width - 40, beltY());
    ctx.stroke();
    ctx.setLineDash([]);

    const bin = binPos();
    ctx.beginPath();
    ctx.strokeStyle = "rgba(148,163,184,0.35)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 5]);
    ctx.moveTo(width - 40, beltY());
    ctx.quadraticCurveTo(width - 20, beltY() + 10, bin.x, bin.y - 18);
    ctx.stroke();
    ctx.setLineDash([]);

    gears.forEach((g) => {
      g.rotation += g.speed;
      drawGear(g);
    });

    boxes.forEach((b) => {
      if (b.diverting) {
        b.divertT += 0.05;
        const t = Math.min(1, b.divertT);
        const x0 = width - 40, y0 = beltY();
        const cx = width - 20, cy = beltY() + 10;
        const x1 = bin.x, y1 = bin.y - 18;
        const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
        const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
        b.x = x;
        drawBox(b, y, 1 - t * 0.5);
        if (t >= 1) {
          binCount += 1;
          binPulse = 1;
          b.diverting = false;
          b.x = -b.size;
          b.lastStation = -1;
          b.palette = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        }
        return;
      }

      b.x += b.speed;
      b.bob += 0.08;
      gears.forEach((g, i) => {
        if (i > b.lastStation && b.x >= g.x) {
          b.lastStation = i;
          popups.push({ x: g.x, y: beltY() - 22, life: 1 });
        }
      });

      if (b.lastStation >= gears.length - 1 && b.x >= width - 40 && Math.random() < 0.35) {
        b.diverting = true;
        b.divertT = 0;
        return;
      }

      if (b.x > width + b.size) {
        b.x = -b.size;
        b.lastStation = -1;
        b.palette = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      }
      drawBox(b, beltY() - 14 + Math.sin(b.bob) * 1.5, 1);
    });

    popups.forEach((p) => {
      p.life -= 0.035;
      p.y -= 0.2;
      drawCheck(p);
    });
    popups = popups.filter((p) => p.life > 0);

    binPulse = Math.max(0, binPulse - 0.02);
    drawBin();

    if (!reduceMotion) requestAnimationFrame(step);
  }

  step();
})();
