(function () {
  const canvases = document.querySelectorAll(".agent-bg");
  if (!canvases.length) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function makeSite(x) {
    return {
      x,
      height: 0,
      maxHeight: 5 + Math.floor(Math.random() * 4),
      blockScale: 0.85 + Math.random() * 0.3,
      state: "growing", // growing | holding | collapsing
      timer: 0,
      collapseCounter: 0,
      pending: false,
    };
  }

  function makeRobot(site, scale) {
    const roamCenter = site.x + (Math.random() - 0.5) * 50;
    return {
      site,
      roamCenter,
      roamRange: 36,
      x: roamCenter,
      vx: (Math.random() < 0.5 ? -1 : 1) * (0.2 + Math.random() * 0.2),
      scale,
      walk: Math.random() * Math.PI * 2,
      blinkAt: 60 + Math.random() * 200,
      buildAt: 60 + Math.random() * 200,
      buildActive: false,
      buildSeq: 0,
      armRaise: 0,
      facing: 1,
      blinking: false,
    };
  }

  function buildScene(canvas) {
    const section = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    const scene = { canvas, ctx, section, width: 0, height: 0, baseY: 0, sites: [], robots: [], flying: [] };

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
      scene.baseY = scene.height - 36;

      const siteCount = Math.max(1, Math.min(3, Math.round(scene.width / 260)));
      const margin = scene.width / (siteCount + 1);
      scene.sites = Array.from({ length: siteCount }, (_, i) => makeSite(margin * (i + 1)));

      const robotCount = Math.max(4, Math.min(8, Math.floor(scene.width / 220)));
      scene.robots = Array.from({ length: robotCount }, (_, i) => {
        const site = scene.sites[i % scene.sites.length];
        return makeRobot(site, 0.85 + Math.random() * 0.4);
      });
      scene.flying = [];
    };

    scene.resize();
    window.addEventListener("resize", scene.resize);
    return scene;
  }

  const scenes = Array.from(canvases).map(buildScene);

  function drawRobot(ctx, r, baseY) {
    const s = r.scale;
    const legShift = Math.sin(r.walk) * 3 * s;

    ctx.save();
    ctx.translate(r.x, baseY);
    if (r.facing < 0) ctx.scale(-1, 1);

    ctx.beginPath();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.ellipse(0, 2, 9 * s, 2.4 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(203,213,225,0.55)";
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(-3 * s, -8 * s);
    ctx.lineTo(-3 * s + legShift, 1 * s);
    ctx.moveTo(3 * s, -8 * s);
    ctx.lineTo(3 * s - legShift, 1 * s);
    ctx.stroke();

    ctx.fillStyle = "rgba(22,34,66,0.9)";
    ctx.strokeStyle = "rgba(203,213,225,0.65)";
    ctx.lineWidth = 1.2 * s;
    ctx.fillRect(-7 * s, -22 * s, 14 * s, 14 * s);
    ctx.strokeRect(-7 * s, -22 * s, 14 * s, 14 * s);

    ctx.beginPath();
    ctx.strokeStyle = "rgba(203,213,225,0.6)";
    ctx.lineWidth = 2 * s;
    const armLift = r.armRaise;
    ctx.moveTo(7 * s, -18 * s);
    ctx.lineTo(7 * s + 5 * s, -18 * s - armLift * 10 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-7 * s, -18 * s);
    ctx.lineTo(-7 * s - 4 * s, -12 * s);
    ctx.stroke();

    ctx.fillStyle = "rgba(22,34,66,0.9)";
    ctx.strokeStyle = "rgba(255,154,92,0.8)";
    ctx.lineWidth = 1.2 * s;
    ctx.fillRect(-5 * s, -32 * s, 10 * s, 9 * s);
    ctx.strokeRect(-5 * s, -32 * s, 10 * s, 9 * s);

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,154,92,0.6)";
    ctx.lineWidth = 1 * s;
    ctx.moveTo(0, -32 * s);
    ctx.lineTo(0, -37 * s);
    ctx.stroke();
    const glow = 0.5 + Math.sin(r.walk * 1.3) * 0.5;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,122,48,${0.5 + glow * 0.5})`;
    ctx.arc(0, -38 * s, 1.6 * s, 0, Math.PI * 2);
    ctx.fill();

    if (!r.blinking) {
      ctx.fillStyle = "rgba(255,154,92,0.9)";
      ctx.fillRect(-3 * s, -29 * s, 2 * s, 2 * s);
      ctx.fillRect(1 * s, -29 * s, 2 * s, 2 * s);
    }

    ctx.restore();
  }

  function drawSite(ctx, site, baseY) {
    const bw = 17 * site.blockScale;
    const bh = 10 * site.blockScale;

    // foundation pad
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(site.x - bw / 2 - 4, baseY - 2, bw + 8, 3);

    const tones = ["rgba(255,154,92,0.55)", "rgba(255,122,48,0.6)", "rgba(203,213,225,0.45)"];
    for (let h = 0; h < site.height; h++) {
      const y = baseY - (h + 1) * bh;
      ctx.fillStyle = "rgba(16,26,48,0.85)";
      ctx.fillRect(site.x - bw / 2, y, bw, bh - 1);
      ctx.strokeStyle = tones[h % tones.length];
      ctx.lineWidth = 1.3;
      ctx.strokeRect(site.x - bw / 2, y, bw, bh - 1);
      ctx.fillStyle = tones[h % tones.length];
      ctx.fillRect(site.x - bw / 2 + 3, y + bh / 2 - 1.5, 3, 3);
    }
  }

  function drawFlying(ctx, f) {
    ctx.save();
    ctx.fillStyle = "rgba(16,26,48,0.9)";
    ctx.strokeStyle = "rgba(255,154,92,0.85)";
    ctx.lineWidth = 1.3;
    const size = 9 * f.scale;
    ctx.translate(f.x, f.y);
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.strokeRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }

  function updateSite(site) {
    if (site.state === "holding") {
      site.timer -= 1;
      if (site.timer <= 0) {
        site.state = "collapsing";
        site.collapseCounter = 0;
      }
    } else if (site.state === "collapsing") {
      site.collapseCounter += 1;
      if (site.collapseCounter % 16 === 0 && site.height > 0) site.height -= 1;
      if (site.height <= 0) site.state = "growing";
    }
  }

  function step(scene) {
    const { ctx, robots, sites } = scene;
    ctx.clearRect(0, 0, scene.width, scene.height);

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.moveTo(0, scene.baseY + 2);
    ctx.lineTo(scene.width, scene.baseY + 2);
    ctx.stroke();

    sites.forEach((site) => updateSite(site));

    robots.forEach((r) => {
      const min = r.roamCenter - r.roamRange;
      const max = r.roamCenter + r.roamRange;
      r.x += r.vx;
      r.facing = r.vx > 0 ? 1 : -1;
      if (r.x < min) { r.x = min; r.vx = Math.abs(r.vx); }
      if (r.x > max) { r.x = max; r.vx = -Math.abs(r.vx); }
      r.walk += 0.12;

      r.blinkAt -= 1;
      r.blinking = r.blinkAt < 6;
      if (r.blinkAt <= 0) r.blinkAt = 90 + Math.random() * 220;

      if (r.buildActive) {
        r.buildSeq += 1;
        if (r.buildSeq <= 16) r.armRaise = r.buildSeq / 16;
        else if (r.buildSeq <= 22) r.armRaise = 1;
        else r.armRaise = Math.max(0, 1 - (r.buildSeq - 22) / 16);

        if (r.buildSeq === 18) {
          const site = r.site;
          scene.flying.push({
            fromX: r.x + r.facing * 9 * r.scale,
            fromY: scene.baseY - 28 * r.scale,
            toX: site.x,
            toY: scene.baseY - (site.height + 1) * 10 * site.blockScale,
            t: 0,
            totalT: 22,
            scale: site.blockScale,
            site,
          });
        }
        if (r.buildSeq >= 38) {
          r.buildActive = false;
          r.buildAt = 160 + Math.random() * 260;
        }
      } else {
        r.buildAt -= 1;
        if (r.buildAt <= 0) {
          const site = r.site;
          if (site.state === "growing" && !site.pending && site.height < site.maxHeight) {
            r.buildActive = true;
            r.buildSeq = 0;
            site.pending = true;
          } else {
            r.buildAt = 40 + Math.random() * 80;
          }
        }
      }

      drawRobot(ctx, r, scene.baseY);
    });

    scene.flying.forEach((f) => {
      f.t += 1;
      const frac = Math.min(1, f.t / f.totalT);
      const arc = Math.sin(frac * Math.PI) * 14;
      const x = f.fromX + (f.toX - f.fromX) * frac;
      const y = f.fromY + (f.toY - f.fromY) * frac - arc;
      drawFlying(ctx, { x, y, scale: f.scale });
    });

    scene.flying = scene.flying.filter((f) => {
      if (f.t >= f.totalT) {
        const site = f.site;
        site.height = Math.min(site.maxHeight, site.height + 1);
        site.pending = false;
        if (site.height >= site.maxHeight) {
          site.state = "holding";
          site.timer = 100 + Math.random() * 160;
        }
        return false;
      }
      return true;
    });

    sites.forEach((site) => drawSite(ctx, site, scene.baseY));
  }

  function loop() {
    scenes.forEach(step);
    if (!reduceMotion) requestAnimationFrame(loop);
  }

  loop();
})();
