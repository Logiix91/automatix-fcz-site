(function () {
  const canvases = document.querySelectorAll(".orchestrate-bg");
  if (!canvases.length) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const PALETTE = [
    { fill: "rgba(11,17,32,0.88)", stroke: "rgba(255,154,92,0.8)" },
    { fill: "rgba(11,17,32,0.88)", stroke: "rgba(56,189,248,0.8)" },
    { fill: "rgba(11,17,32,0.88)", stroke: "rgba(52,211,153,0.8)" },
    { fill: "rgba(11,17,32,0.88)", stroke: "rgba(168,162,255,0.8)" },
  ];

  function makePackets() {
    const out = [];
    for (let lane = 0; lane < 2; lane++) {
      for (let i = 0; i < 3; i++) {
        out.push({
          lane,
          x: -(i * 90) - Math.random() * 60,
          size: 11 + Math.random() * 4,
          speed: 0.5 + Math.random() * 0.15,
          bob: Math.random() * Math.PI * 2,
          stage: "lane",
          mergeT: 0,
          fromY: 0,
          lastGear: -1,
          palette: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          rejectChance: lane === 0 ? 0.18 : 0,
        });
      }
    }
    return out;
  }

  function buildScene(canvas) {
    const ctx = canvas.getContext("2d");
    const scene = { canvas, ctx, width: 0, height: 0, gears: [], packets: [], popups: [], rejects: [], scanX: -0.2 };

    scene.resize = function () {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      scene.width = rect.width;
      scene.height = rect.height;
      canvas.width = scene.width * dpr;
      canvas.height = scene.height * dpr;
      canvas.style.width = scene.width + "px";
      canvas.style.height = scene.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      scene.laneTopY = scene.height * 0.26;
      scene.laneBotY = scene.height * 0.76;
      scene.outY = scene.height * 0.5;
      scene.mergeX = scene.width * 0.4;

      const gearCount = Math.max(2, Math.min(4, Math.round(scene.width / 220)));
      const margin = (scene.width - scene.mergeX - 30) / (gearCount + 1);
      scene.gears = Array.from({ length: gearCount }, (_, i) => ({
        x: scene.mergeX + 30 + margin * (i + 1),
        r: 11,
        rotation: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.012,
      }));

      scene.packets = makePackets();
      scene.popups = [];
      scene.rejects = [];
      scene.scanX = -0.2;
    };

    scene.resize();
    window.addEventListener("resize", scene.resize);
    return scene;
  }

  const scenes = Array.from(canvases).map(buildScene);

  function drawGear(ctx, g, y) {
    ctx.save();
    ctx.translate(g.x, y);
    ctx.rotate(g.rotation);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(100,116,139,0.55)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, g.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = "rgba(100,116,139,0.55)";
      ctx.fillRect(-1.6, -g.r - 3.5, 3.2, 5);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,122,48,0.9)";
    ctx.arc(0, 0, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPacket(ctx, p, x, y, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.fillStyle = p.palette.fill;
    ctx.strokeStyle = p.palette.stroke;
    ctx.lineWidth = 1.3;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.moveTo(-p.size / 2, -1);
    ctx.lineTo(p.size / 2, -1);
    ctx.stroke();
    ctx.restore();
  }

  function drawCheck(ctx, pp) {
    ctx.save();
    ctx.translate(pp.x, pp.y);
    ctx.globalAlpha = Math.max(pp.life, 0);
    ctx.strokeStyle = "rgba(255,122,48,0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(-1, 3);
    ctx.lineTo(4, -4);
    ctx.stroke();
    ctx.restore();
  }

  function laneY(scene, lane) {
    return lane === 0 ? scene.laneTopY : scene.laneBotY;
  }

  function resetPacket(p) {
    p.stage = "lane";
    p.x = -20 - Math.random() * 60;
    p.lastGear = -1;
    p.palette = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  }

  function spawnPuff(scene, x, y) {
    scene.rejects.push({ x, y, r: 2, life: 1 });
  }

  function step(scene) {
    const { ctx, width, height } = scene;
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.strokeStyle = "rgba(148,163,184,0.4)";
    ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 5]);
    ctx.moveTo(8, scene.laneTopY);
    ctx.lineTo(scene.mergeX, scene.laneTopY);
    ctx.moveTo(8, scene.laneBotY);
    ctx.lineTo(scene.mergeX, scene.laneBotY);
    ctx.moveTo(scene.mergeX + 30, scene.outY);
    ctx.lineTo(width - 8, scene.outY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.strokeStyle = "rgba(148,163,184,0.16)";
    ctx.lineWidth = 1.2;
    ctx.moveTo(scene.mergeX, scene.laneTopY);
    ctx.quadraticCurveTo(scene.mergeX + 30, scene.outY, scene.mergeX + 30, scene.outY);
    ctx.moveTo(scene.mergeX, scene.laneBotY);
    ctx.quadraticCurveTo(scene.mergeX + 30, scene.outY, scene.mergeX + 30, scene.outY);
    ctx.stroke();

    scene.scanX += width / 6000;
    if (scene.scanX > 1.3) scene.scanX = -0.3;
    const sx = scene.scanX * width;
    const grad = ctx.createLinearGradient(sx - 40, 0, sx + 40, 0);
    grad.addColorStop(0, "rgba(255,154,92,0)");
    grad.addColorStop(0.5, "rgba(255,154,92,0.06)");
    grad.addColorStop(1, "rgba(255,154,92,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    scene.gears.forEach((g) => {
      g.rotation += g.speed;
      drawGear(ctx, g, scene.outY);
    });

    scene.packets.forEach((p) => {
      if (p.stage === "lane") {
        p.x += p.speed;
        p.bob += 0.08;
        const y = laneY(scene, p.lane);
        if (p.x >= scene.mergeX) {
          p.fromY = y;
          p.mergeT = 0;
          p.stage = p.lane === 0 && Math.random() < p.rejectChance ? "reject" : "merging";
        } else {
          drawPacket(ctx, p, p.x, y + Math.sin(p.bob) * 1.3, 1);
        }
        return;
      }
      if (p.stage === "merging") {
        p.mergeT += 0.045;
        const t = Math.min(1, p.mergeT);
        const x0 = scene.mergeX, y0 = p.fromY;
        const cx = scene.mergeX + 30, cy = scene.outY;
        const x1 = scene.mergeX + 30, y1 = scene.outY;
        const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
        const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
        drawPacket(ctx, p, x, y, 1);
        if (t >= 1) { p.stage = "output"; p.x = x1; }
        return;
      }
      if (p.stage === "reject") {
        p.mergeT += 0.05;
        const t = Math.min(1, p.mergeT);
        const x = scene.mergeX + t * 14;
        const y = p.fromY + t * (scene.height - p.fromY - 6);
        drawPacket(ctx, p, x, y, 1 - t * 0.8);
        if (t >= 1) {
          spawnPuff(scene, x, y);
          resetPacket(p);
        }
        return;
      }
      if (p.stage === "output") {
        p.x += p.speed;
        p.bob += 0.08;
        scene.gears.forEach((g, i) => {
          if (i > p.lastGear && p.x >= g.x) {
            p.lastGear = i;
            scene.popups.push({ x: g.x, y: scene.outY - 18, life: 1 });
          }
        });
        if (p.x > width + p.size) {
          resetPacket(p);
        } else {
          drawPacket(ctx, p, p.x, scene.outY + Math.sin(p.bob) * 1.3, 1);
        }
      }
    });

    scene.popups.forEach((pp) => { pp.life -= 0.035; pp.y -= 0.2; drawCheck(ctx, pp); });
    scene.popups = scene.popups.filter((pp) => pp.life > 0);

    scene.rejects.forEach((r) => {
      r.life -= 0.04;
      r.r += 0.3;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(248,113,113,${Math.max(r.life, 0) * 0.7})`;
      ctx.lineWidth = 1.4;
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    });
    scene.rejects = scene.rejects.filter((r) => r.life > 0);
  }

  scenes.forEach((scene) => {
    function frame() {
      step(scene);
      if (!reduceMotion) requestAnimationFrame(frame);
    }
    frame();
  });
})();
