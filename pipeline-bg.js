(function () {
  const canvas = document.querySelector(".pipeline-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width, height, dpr;
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
  }

  function beltY() {
    return height / 2 + 10;
  }

  function makeGears() {
    const count = 3;
    const margin = width / (count + 1);
    return Array.from({ length: count }, (_, i) => ({
      x: margin * (i + 1),
      r: 16,
      rotation: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.01,
    }));
  }

  function makeBoxes() {
    const count = 5;
    return Array.from({ length: count }, (_, i) => ({
      x: (width / count) * i - 20,
      size: 16,
      speed: 0.55,
      bob: Math.random() * Math.PI * 2,
      lastStation: -1,
    }));
  }

  let gears = [];
  let boxes = [];
  let popups = [];

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
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBox(b) {
    const y = beltY() - 14 + Math.sin(b.bob) * 1.5;
    ctx.save();
    ctx.translate(b.x, y);
    ctx.fillStyle = "rgba(11,17,32,0.88)";
    ctx.strokeStyle = "rgba(255,154,92,0.8)";
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

  function step() {
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.strokeStyle = "rgba(148,163,184,0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.moveTo(8, beltY());
    ctx.lineTo(width - 8, beltY());
    ctx.stroke();
    ctx.setLineDash([]);

    gears.forEach((g) => {
      g.rotation += g.speed;
      drawGear(g);
    });

    boxes.forEach((b) => {
      b.x += b.speed;
      b.bob += 0.08;
      gears.forEach((g, i) => {
        if (i > b.lastStation && b.x >= g.x) {
          b.lastStation = i;
          popups.push({ x: g.x, y: beltY() - 26, life: 1 });
        }
      });
      if (b.x > width + b.size) {
        b.x = -b.size;
        b.lastStation = -1;
      }
      drawBox(b);
    });

    popups.forEach((p) => {
      p.life -= 0.035;
      p.y -= 0.2;
      drawCheck(p);
    });
    popups = popups.filter((p) => p.life > 0);

    if (!reduceMotion) requestAnimationFrame(step);
  }

  step();
})();
