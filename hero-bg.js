(function () {
  const canvases = document.querySelectorAll(".hero-bg");
  if (!canvases.length) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function makeSatellite(i) {
    return {
      angleOffset: (i / 1) * 0,
      angle: Math.random() * Math.PI * 2,
      radiusX: 0,
      radiusY: 0,
      speed: (Math.random() < 0.5 ? -1 : 1) * (0.0026 + Math.random() * 0.0016),
      size: 5 + Math.random() * 3,
      packetTimer: 40 + Math.random() * 160,
      packets: [],
    };
  }

  function makeMote(width, height) {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.5 + Math.random() * 1.2,
      vy: -(0.05 + Math.random() * 0.1),
      phase: Math.random() * Math.PI * 2,
    };
  }

  function buildScene(canvas) {
    const section = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    const scene = {
      canvas, ctx, section, width: 0, height: 0,
      hub: { x: 0, y: 0, pulse: 0, ring: 0 },
      satellites: [], motes: [], bursts: [],
      sweep: -0.2,
    };

    scene.resize = function () {
      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      scene.width = rect.width;
      scene.height = rect.height;
      canvas.width = scene.width * dpr;
      canvas.height = scene.height * dpr;
      canvas.style.width = scene.width + "px";
      canvas.style.height = scene.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      scene.hub.x = scene.width * 0.76;
      scene.hub.y = scene.height * 0.4;

      const count = Math.max(4, Math.min(7, Math.round(scene.width / 170)));
      scene.satellites = Array.from({ length: count }, (_, i) => makeSatellite(i));
      const baseR = Math.min(scene.width * 0.42, scene.height * 0.62);
      scene.satellites.forEach((s, i) => {
        s.radiusX = baseR * (0.55 + (i % 3) * 0.22);
        s.radiusY = s.radiusX * 0.6;
      });

      const moteCount = Math.max(14, Math.min(40, Math.floor(scene.width / 26)));
      scene.motes = Array.from({ length: moteCount }, () => makeMote(scene.width, scene.height));
      scene.bursts = [];
    };

    scene.resize();
    window.addEventListener("resize", scene.resize);
    return scene;
  }

  const scenes = Array.from(canvases).map(buildScene);

  function satPos(scene, s) {
    return {
      x: scene.hub.x + Math.cos(s.angle) * s.radiusX,
      y: scene.hub.y + Math.sin(s.angle) * s.radiusY,
    };
  }

  function drawHub(ctx, hub) {
    const pulse = 0.5 + Math.sin(hub.pulse) * 0.5;
    ctx.save();
    ctx.translate(hub.x, hub.y);

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,154,92,${0.13 - i * 0.035})`;
      ctx.lineWidth = 1;
      ctx.arc(0, 0, 30 + i * 16 + pulse * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.rotate(hub.ring);
    ctx.strokeStyle = "rgba(255,154,92,0.35)";
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r1 = 21, r2 = i % 3 === 0 ? 27 : 24;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = "rgba(16,26,48,0.95)";
    ctx.strokeStyle = `rgba(255,154,92,${0.7 + pulse * 0.3})`;
    ctx.lineWidth = 2;
    roundRectPath(ctx, -14, -14, 28, 28, 7);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = `rgba(255,154,92,${0.6 + pulse * 0.4})`;
    for (let gx = -1; gx <= 1; gx++) {
      for (let gy = -1; gy <= 1; gy++) {
        ctx.beginPath();
        ctx.arc(gx * 7, gy * 7, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawSatellite(ctx, pos, s) {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.fillStyle = "rgba(16,26,48,0.92)";
    ctx.strokeStyle = "rgba(203,213,225,0.6)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, 0, s.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = "rgba(56,189,248,0.85)";
    ctx.arc(0, 0, s.size * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function spawnBurst(scene, x, y) {
    const count = 8 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 0.9;
      scene.bursts.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        r: 1 + Math.random() * 1.3,
        life: 1,
      });
    }
  }

  function step(scene) {
    const { ctx, width, height, hub } = scene;
    ctx.clearRect(0, 0, width, height);

    scene.motes.forEach((m) => {
      m.y += m.vy;
      m.phase += 0.03;
      if (m.y < -5) { m.y = height + 5; m.x = Math.random() * width; }
      const tw = 0.4 + Math.sin(m.phase) * 0.3;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,200,170,${Math.max(0, tw) * 0.45})`;
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    });

    scene.sweep += 0.0022;
    if (scene.sweep > 1.3) scene.sweep = -0.3;
    const sx = scene.sweep * width;
    const grad = ctx.createLinearGradient(sx - 70, 0, sx + 70, 0);
    grad.addColorStop(0, "rgba(255,154,92,0)");
    grad.addColorStop(0.5, "rgba(255,154,92,0.05)");
    grad.addColorStop(1, "rgba(255,154,92,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    hub.pulse += 0.04;
    hub.ring += 0.0035;

    scene.satellites.forEach((s) => {
      s.angle += s.speed;
      const pos = satPos(scene, s);

      const midx = (hub.x + pos.x) / 2 + Math.sin(hub.pulse + s.angle) * 10;
      const midy = (hub.y + pos.y) / 2 + Math.cos(hub.pulse + s.angle) * 10;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.moveTo(hub.x, hub.y);
      ctx.quadraticCurveTo(midx, midy, pos.x, pos.y);
      ctx.stroke();

      s.packetTimer -= 1;
      if (s.packetTimer <= 0) {
        s.packets.push({ t: 0, toHub: Math.random() < 0.6 });
        s.packetTimer = 90 + Math.random() * 180;
      }
      s.packets.forEach((p) => {
        p.t += 0.022;
        const a = p.toHub ? 1 - p.t : p.t;
        const x = (1 - a) * (1 - a) * hub.x + 2 * (1 - a) * a * midx + a * a * pos.x;
        const y = (1 - a) * (1 - a) * hub.y + 2 * (1 - a) * a * midy + a * a * pos.y;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,154,92,0.9)";
        ctx.shadowColor = "rgba(255,122,48,0.7)";
        ctx.shadowBlur = 6;
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      s.packets = s.packets.filter((p) => {
        if (p.t >= 1) {
          if (p.toHub) { hub.pulse = 0; spawnBurst(scene, hub.x, hub.y); }
          return false;
        }
        return true;
      });

      drawSatellite(ctx, pos, s);
    });

    drawHub(ctx, hub);

    scene.bursts.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.01;
      p.life -= 0.03;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,154,92,${Math.max(p.life, 0)})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    scene.bursts = scene.bursts.filter((p) => p.life > 0);
  }

  function loop() {
    scenes.forEach(step);
    if (!reduceMotion) requestAnimationFrame(loop);
  }

  loop();
})();
