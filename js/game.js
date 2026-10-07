(function () {
  const P = window.Pulse;
  const G = {
    state: P.STATES.MENU,
    modeId: null,
    config: null,
    balls: [],
    particles: [],
    popups: [],
    width: 800,
    height: 500,
    elapsed: 0,
    remaining: 0,
    hudClock: 0,
    timeBonus: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    lives: 3,
    taps: 0,
    hazards: 0,
    spawnClock: 0,
    slowUntil: 0,
    scoreBoostUntil: 0,
    shieldUsed: false,
    hazardShieldUsed: false,
    steadyUsed: false,
    focusUsed: false,
    healUsed: false,
    echoCount: 0,
    firstHit: true,
    shake: 0,
    lastFrame: 0,
    storyStage: 1,
    storyGoal: 100,
    storyBoss: false,
    bossNumber: 1,
    bossName: "VÉSPER",
    bossHP: 0,
    bossMaxHP: 0,
    startToken: 0,
    pendingStartToken: 0,
    result: null,
  };
  P.Game = G;
  function arena() {
    return document.getElementById("arena");
  }
  function fitted() {
    const canvas = arena();
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect(),
      dpr = Math.min(window.devicePixelRatio || 1, 2);
    G.width = Math.max(1, rect.width);
    G.height = Math.max(1, rect.height);
    canvas.width = Math.round(G.width * dpr);
    canvas.height = Math.round(G.height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    G.ctx = ctx;
    G.balls.forEach((ball) => P.Physics.reflect(ball, G.width, G.height));
  }
  G.resize = fitted;
  G.start = (modeId, options = {}) => {
    const config = P.Modes[modeId];
    if (!config) return;
    const startToken = ++G.startToken;
    G.pendingStartToken = startToken;
    P.UI.hideOverlay();
    G.modeId = modeId;
    G.config = config;
    G.ctx = null;
    G.state = P.STATES.PLAYING;
    P.state.gameState = G.state;
    G.elapsed = 0;
    G.hudClock = 0;
    G.remaining = config.duration || 0;
    G.timeBonus = 0;
    G.score = 0;
    G.combo = 0;
    G.bestCombo = 0;
    G.lives = config.lives;
    G.taps = 0;
    G.hazards = 0;
    G.spawnClock = 0;
    G.slowUntil = 0;
    G.scoreBoostUntil = 0;
    G.shieldUsed = false;
    G.hazardShieldUsed = false;
    G.steadyUsed = false;
    G.focusUsed = false;
    G.healUsed = false;
    G.echoCount = 0;
    G.firstHit = true;
    G.result = null;
    G.storyStage = options.stage || P.state.save.story.stage;
    G.storyGoal = 80 + Math.floor(Math.sqrt(G.storyStage) * 20);
    if (modeId === "story")
      G.config = {
        ...config,
        speed: Math.min(
          420,
          config.speed * (1 + Math.log2(G.storyStage) * 0.07),
        ),
        balls: 5,
        hazards: true,
        hazardEvery: Math.max(3, 5 - G.storyStage * 0.002),
      };
    G.storyBoss = modeId === "story" && G.storyStage % 5 === 0;
    if (G.storyBoss)
      G.config = { ...G.config, short: "STORY BOSS", balls: 0, hazards: true };
    G.bossNumber = G.storyBoss ? G.storyStage / 5 : options.boss || 1;
    G.bossName = ["VÉSPER", "NOCTIS", "ARCADIA", "SOLARIS", "OBLIVION"][
      (G.bossNumber - 1) % 5
    ];
    G.bossHP =
      modeId === "boss" || G.storyBoss ? 10 + (G.bossNumber - 1) * 3 : 0;
    G.bossMaxHP = G.bossHP;
    G.particles = [];
    G.popups = [];
    G.balls = [];
    G.spawnClock = 0;
    P.state.screen = "game";
    P.UI.render();
    P.Audio.setScene("game");
    if (P.Skills.has("life") && Number.isFinite(G.lives)) G.lives++;
    if (P.Skills.has("time") && G.remaining) G.timeBonus = 5;
    P.Progression.event("games", 1, modeId);
    if (P.state.save.inventory.equippedSkills.length)
      P.Progression.event("skills", 1, modeId);
    P.Storage.save();
    P.emit("gamestart", { modeId });
    if (arena()) G.mountArena();
  };
  G.findSpawnPosition = (radius, spacing = 16) => {
    const wallInset = radius + 18;
    let x = G.width / 2;
    let y = G.height / 2;
    for (let attempt = 0; attempt < 32; attempt++) {
      x =
        G.width <= wallInset * 2
          ? G.width / 2
          : wallInset + Math.random() * (G.width - wallInset * 2);
      y =
        G.height <= wallInset * 2
          ? G.height / 2
          : wallInset + Math.random() * (G.height - wallInset * 2);
      const overlaps = G.balls.some(
        (ball) =>
          ball.active &&
          Math.hypot(ball.x - x, ball.y - y) < radius + ball.radius + spacing,
      );
      if (!overlaps) break;
    }
    return { x, y };
  };
  G.initializeBalls = () => {
    G.balls = [];
    if (G.modeId === "boss" || G.storyBoss) {
      G.balls.push(
        P.Physics.createBall({
          x: G.width / 2,
          y: G.height / 2,
          radius: Math.min(34, G.width / 6, G.height / 4),
          speed: G.config.speed + G.bossNumber * 6,
          color: "#ff5ebc",
          type: "boss",
        }),
      );
      G.spawnHazard();
      return;
    }
    for (let index = 0; index < G.config.balls; index++) {
      const radius = G.modeId === "frantic" ? 15 : 17;
      const position = G.findSpawnPosition(radius);
      G.balls.push(
        P.Physics.createBall({
          ...position,
          radius,
          speed: G.config.speed,
          color: ["#50e7f4", "#8aa7ff", "#d28bff", "#76f0bc", "#ff83d1"][
            index % 5
          ],
        }),
      );
    }
    if (G.modeId === "story" || G.modeId === "classic") G.spawnHazard();
  };
  G.mountArena = () => {
    G.resize();
    if (G.pendingStartToken !== G.startToken || G.state !== P.STATES.PLAYING) {
      G.draw();
      return;
    }
    G.pendingStartToken = 0;
    G.initializeBalls();
    P.UI.updateHUD();
    G.draw();
  };
  G.pause = () => {
    if (G.state !== P.STATES.PLAYING) return;
    G.state = P.STATES.PAUSED;
    P.state.gameState = G.state;
    P.UI.showPause();
  };
  G.resume = () => {
    if (G.state !== P.STATES.PAUSED) return;
    G.state = P.STATES.PLAYING;
    P.state.gameState = G.state;
    G.lastFrame = performance.now();
    P.UI.hideOverlay();
  };
  G.frame = (now) => {
    const dt = G.lastFrame ? Math.max(0, (now - G.lastFrame) / 1000) : 0;
    G.lastFrame = now;
    if (G.state === P.STATES.PLAYING) G.update(dt);
    if (P.state.screen === "game") G.draw();
  };
  G.update = (dt) => {
    if (G.state !== P.STATES.PLAYING || !G.ctx) return;
    G.elapsed += dt;
    if (G.config.duration) {
      G.remaining = Math.max(0, G.config.duration + G.timeBonus - G.elapsed);
      if (G.remaining <= 0) {
        G.finish("RESULT");
        return;
      }
    }
    G.hudClock += dt;
    if (G.hudClock >= 0.1) {
      G.hudClock %= 0.1;
      P.UI.updateHUD();
    }
    const speedFactor = G.elapsed < G.slowUntil ? 0.55 : 1;
    let remaining = dt;
    while (remaining > 0) {
      const slice = Math.min(remaining, 1 / 120);
      for (const ball of G.balls)
        P.Physics.step(ball, slice, G.width, G.height, speedFactor);
      P.Physics.resolveCollisions(G.balls, G.width, G.height);
      for (const particle of G.particles) {
        particle.x += particle.vx * slice;
        particle.y += particle.vy * slice;
        particle.life -= slice;
        particle.vx *= Math.max(0, 1 - slice * 2.3);
        particle.vy *= Math.max(0, 1 - slice * 2.3);
      }
      remaining -= slice;
    }
    G.particles = G.particles.filter((p) => p.life > 0);
    G.popups = G.popups.filter((popup) => {
      popup.life -= dt;
      popup.y -= 30 * dt;
      return popup.life > 0;
    });
    G.spawnClock += dt;
    if (G.config.hazards && G.spawnClock >= G.config.hazardEvery) {
      G.spawnClock -= G.config.hazardEvery;
      G.spawnHazard();
    }
    G.shake = Math.max(0, G.shake - dt * 24);
    if (G.modeId === "story" && !G.storyBoss && G.score >= G.storyGoal) {
      G.finish("VICTORY");
    }
    if ((G.modeId === "boss" || G.storyBoss) && G.bossHP <= 0)
      G.finish("VICTORY");
  };
  G.spawnHazard = () => {
    if (
      G.balls.filter((ball) => ball.type === "hazard" && ball.active).length >=
      3
    )
      return;
    const radius = Math.min(25, G.width / 8, Math.max(18, G.height / 7));
    const position = G.findSpawnPosition(radius, 24);
    G.balls.push(
      P.Physics.createBall({
        ...position,
        radius,
        speed: (G.config?.speed || 190) * 1.12,
        color: "#ff5877",
        type: "hazard",
      }),
    );
    G.hazards++;
    P.Audio.play("hazard");
  };
  G.draw = () => {
    const canvas = arena();
    if (!canvas || !G.ctx) return;
    const c = G.ctx,
      w = G.width,
      h = G.height;
    c.clearRect(0, 0, w, h);
    const bg = c.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#0a1020");
    bg.addColorStop(0.52, "#080d1b");
    bg.addColorStop(1, "#0c1022");
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 55; i++) {
      const x = (i * 127.1 + 31) % w,
        y = (i * 73.7 + 17) % h;
      c.globalAlpha = 0.13 + (i % 5) * 0.035;
      c.fillStyle = i % 7 === 0 ? "#bd9eff" : "#a2deff";
      c.fillRect(x, y, 1, 1);
    }
    c.globalAlpha = 1;
    const equipped = P.state.save.inventory.equipped,
      skin = P.Shop.items.find((item) => item.id === equipped.orb),
      trail = P.Shop.items.find((item) => item.id === equipped.trail),
      aura = P.Shop.items.find((item) => item.id === equipped.aura);
    for (const ball of G.balls) {
      if (!ball.active) continue;
      if (ball.trail.length > 1) {
        c.beginPath();
        ball.trail.forEach((point, index) =>
          index ? c.lineTo(point.x, point.y) : c.moveTo(point.x, point.y),
        );
        c.lineTo(ball.x, ball.y);
        c.lineWidth = ball.radius * 0.82;
        c.lineCap = "round";
        c.lineJoin = "round";
        const gradient = c.createLinearGradient(
          ball.trail[0].x,
          ball.trail[0].y,
          ball.x,
          ball.y,
        );
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(
          1,
          ball.type === "hazard"
            ? "rgba(255,88,119,.45)"
            : (trail?.color || ball.color) + "88",
        );
        c.strokeStyle = gradient;
        c.stroke();
      }
      const pulse = 1 + Math.sin(ball.phase) * 0.035,
        r = ball.radius * pulse,
        color = ball.type === "target" ? skin?.color || ball.color : ball.color;
      c.save();
      c.shadowBlur =
        ball.type === "hazard"
          ? 22
          : ball.type === "boss"
            ? 31
            : aura?.id === "aura-crown"
              ? 38
              : 16;
      c.shadowColor = color;
      c.fillStyle = color;
      c.globalAlpha = 0.1;
      c.beginPath();
      c.arc(ball.x, ball.y, r * 1.25, 0, Math.PI * 2);
      c.fill();
      c.globalAlpha = 1;
      c.beginPath();
      c.arc(ball.x, ball.y, r, 0, Math.PI * 2);
      const orb = c.createRadialGradient(
        ball.x - r * 0.3,
        ball.y - r * 0.35,
        1,
        ball.x,
        ball.y,
        r,
      );
      orb.addColorStop(0, "#ffffff");
      orb.addColorStop(0.18, color);
      orb.addColorStop(1, ball.type === "hazard" ? "#922943" : color);
      c.fillStyle = orb;
      c.fill();
      c.shadowBlur = 0;
      c.strokeStyle =
        ball.type === "hazard"
          ? "rgba(255,244,247,.95)"
          : "rgba(244,250,255,.72)";
      c.lineWidth = 1.25;
      c.beginPath();
      c.arc(ball.x, ball.y, r - 0.6, 0, Math.PI * 2);
      c.stroke();
      if (ball.type === "hazard") {
        c.strokeStyle = "#ffe5e8";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(ball.x - r * 0.35, ball.y - r * 0.35);
        c.lineTo(ball.x + r * 0.35, ball.y + r * 0.35);
        c.moveTo(ball.x + r * 0.35, ball.y - r * 0.35);
        c.lineTo(ball.x - r * 0.35, ball.y + r * 0.35);
        c.stroke();
      }
      if (ball.type === "boss") {
        c.strokeStyle = "rgba(255,255,255,.8)";
        c.lineWidth = 2;
        c.beginPath();
        c.arc(ball.x, ball.y, r * 0.55, 0, Math.PI * 2);
        c.stroke();
      }
      c.restore();
    }
    for (const particle of G.particles) {
      c.globalAlpha = P.clamp(particle.life / particle.max, 0.0, 1);
      c.fillStyle = particle.color;
      c.shadowColor = particle.color;
      c.shadowBlur = 8;
      c.beginPath();
      c.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      c.fill();
    }
    for (const popup of G.popups) {
      c.save();
      c.globalAlpha = P.clamp(popup.life / popup.max, 0, 1);
      c.font = "700 15px 'DM Sans', sans-serif";
      c.textAlign = "center";
      c.fillStyle = popup.color;
      c.shadowColor = popup.color;
      c.shadowBlur = 12;
      c.fillText(popup.text, popup.x, popup.y);
      c.restore();
    }
    c.globalAlpha = 1;
    c.shadowBlur = 0;
  };
  G.hit = (x, y) => {
    if (G.state !== P.STATES.PLAYING) return false;
    const canvas = arena();
    if (!canvas) return false;
    const rect = canvas.getBoundingClientRect(),
      px = x - rect.left,
      py = y - rect.top;
    const bonus =
      (P.Skills.has("radius") ? 8 : 0) +
      (P.Skills.has("radius") && G.config.duration && G.remaining <= 20
        ? 4
        : 0);
    const target = [...G.balls]
      .reverse()
      .find((ball) => P.Physics.contains(ball, px, py, bonus));
    if (!target) {
      G.miss();
      return false;
    }
    if (target.type === "hazard") {
      if (
        (P.Skills.has("hazard") && !G.shieldUsed) ||
        (P.Skills.has("hazardShield") && !G.hazardShieldUsed)
      ) {
        if (P.Skills.has("hazard")) G.shieldUsed = true;
        if (P.Skills.has("hazardShield")) G.hazardShieldUsed = true;
        target.active = false;
        G.burst(target.x, target.y, "#50e7f4", 20);
        P.UI.toast("Proteção contra perigo ativada.");
        return true;
      }
      target.active = false;
      G.burst(target.x, target.y, "#ff5877", 18);
      if (G.modeId === "story") {
        G.finish("GAME_OVER", "O alvo vermelho encerrou o estágio.");
      } else if (G.modeId === "classic") {
        G.combo = 0;
        G.score = Math.max(0, G.score - 20);
        P.Audio.play("miss");
        P.UI.toast("Alvo vermelho! Combo encerrado, -20 pontos.");
        P.UI.updateHUD();
      } else G.loseLife("Alvo perigoso!");
      return true;
    }
    target.trail.length = 0;
    G.taps++;
    G.combo++;
    G.bestCombo = Math.max(G.bestCombo, G.combo);
    const multiplier =
      (P.Skills.has("combo") ? 2 : 1) + Math.floor(G.combo / 5) * 0.25;
    let points = Math.round(
      10 *
        multiplier *
        (P.Skills.has("scoreBonus") ? 1.15 : 1) *
        (G.elapsed < G.scoreBoostUntil ? 2 : 1),
    );
    if (G.firstHit && P.Skills.has("firstHit")) points += 10;
    G.firstHit = false;
    if (G.modeId === "boss" || G.storyBoss) points = 1;
    G.score += points;
    G.echoCount++;
    if (P.Skills.has("echo") && G.echoCount % 12 === 0) G.score += 5;
    if (P.Skills.has("surge") && G.taps % 20 === 0)
      G.scoreBoostUntil = G.elapsed + 5;
    if (P.Skills.has("slow") && G.combo === 10) G.slowUntil = G.elapsed + 4;
    if (
      P.Skills.has("heal") &&
      G.taps >= 25 &&
      !G.healUsed &&
      Number.isFinite(G.lives)
    ) {
      G.lives++;
      G.healUsed = true;
      P.UI.toast("Segundo Fôlego: +1 vida");
    }
    if (P.Skills.has("coins") && G.combo % 5 === 0)
      P.state.save.profile.coins += 2;
    if (P.Skills.has("coins") && G.taps % 10 === 0)
      P.state.save.profile.coins++;
    if (G.modeId === "boss" || G.storyBoss)
      G.bossHP -= P.Skills.has("boss") ? 2 : 1;
    const impactX = target.x;
    const impactY = target.y;
    G.burst(impactX, impactY, skinColor(), 14);
    G.popups.push({
      x: impactX,
      y: impactY - target.radius,
      text: `+${points}${G.combo >= 2 ? ` · ${G.combo}×` : ""}`,
      color: skinColor(),
      life: 0.8,
      max: 0.8,
    });
    if (target.type === "boss") {
      const angle = Math.atan2(target.y - py, target.x - px);
      target.vx += Math.cos(angle) * 70;
      target.vy += Math.sin(angle) * 70;
    } else {
      G.reposition(target, impactX, impactY);
    }
    P.Audio.play(G.combo > 0 && G.combo % 5 === 0 ? "combo" : "hit");
    P.Progression.event("taps", 1, G.modeId);
    P.Progression.event("combo", G.combo, G.modeId);
    P.Progression.event("score", points, G.modeId);
    if (G.modeId === "hundred" && G.taps >= 100) G.finish("VICTORY");
    if (G.modeId === "story" && G.score >= G.storyGoal) G.finish("VICTORY");
    if (
      Math.random() < 0.035 &&
      !P.state.save.codex.includes("orb-" + ((G.taps % 19) + 1))
    )
      P.state.save.codex.push("orb-" + ((G.taps % 19) + 1));
    P.Achievements.update();
    P.Storage.save();
    P.UI.updateHUD();
    return true;
  };
  G.reposition = (target, hitX, hitY) => {
    const minDistance = Math.min(150, Math.min(G.width, G.height) * 0.35);
    const wallInset = target.radius + 18;
    let x = target.x;
    let y = target.y;
    for (let attempt = 0; attempt < 12; attempt++) {
      x =
        G.width <= wallInset * 2
          ? G.width / 2
          : wallInset + Math.random() * (G.width - wallInset * 2);
      y =
        G.height <= wallInset * 2
          ? G.height / 2
          : wallInset + Math.random() * (G.height - wallInset * 2);
      const overlaps = G.balls.some(
        (other) =>
          other !== target &&
          other.active &&
          Math.hypot(other.x - x, other.y - y) <
            target.radius + other.radius + 12,
      );
      if (!overlaps && Math.hypot(x - hitX, y - hitY) >= minDistance) break;
    }
    const speed = Math.max(120, Math.hypot(target.vx, target.vy));
    const angle = Math.random() * Math.PI * 2;
    target.x = x;
    target.y = y;
    target.vx = Math.cos(angle) * speed;
    target.vy = Math.sin(angle) * speed;
    target.trail.length = 0;
  };
  function skinColor() {
    const skin = P.Shop.items.find(
      (item) => item.id === P.state.save.inventory.equipped.orb,
    );
    return skin?.color || "#50e7f4";
  }
  G.burst = (x, y, color, count) => {
    const burstId = P.state.save.inventory.equipped.burst;
    const particleCount = burstId === "burst-supernova" ? count * 1.6 : count;
    const colors =
      burstId === "burst-prism"
        ? [color, "#50e7f4", "#ff83d1", "#a582ff"]
        : [color];
    for (let i = 0; i < particleCount && G.particles.length < 220; i++) {
      const angle = Math.random() * Math.PI * 2,
        speed =
          35 + Math.random() * (burstId === "burst-supernova" ? 260 : 190);
      G.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.28 + Math.random() * 0.48,
        max: 0.76,
        size: 1.2 + Math.random() * (burstId === "burst-supernova" ? 4.5 : 2.8),
        color: colors[i % colors.length],
      });
    }
    G.shake = Math.max(G.shake, 0.12);
  };
  G.miss = () => {
    if (P.Skills.has("shield") && !G.shieldUsed) {
      G.shieldUsed = true;
      P.UI.toast("Escudo Pulse absorveu o erro.");
      return;
    }
    if (P.Skills.has("steady") && !G.steadyUsed) {
      G.steadyUsed = true;
      P.UI.toast("Mão Firme preservou seu combo.");
      return;
    }
    if (P.Skills.has("focus") && !G.focusUsed) {
      G.focusUsed = true;
      P.UI.toast("Foco Absoluto absorveu a penalidade.");
      return;
    }
    if (G.config.miss === "life" || G.modeId === "boss" || G.modeId === "story")
      G.loseLife("Errou o toque.");
    else {
      G.combo = 0;
      P.Audio.play("miss");
      P.UI.updateHUD();
    }
  };
  G.loseLife = (reason) => {
    if (!Number.isFinite(G.lives)) return;
    G.lives--;
    G.combo = 0;
    G.shake = 0.35;
    P.Audio.play("miss");
    P.UI.updateHUD();
    if (G.lives <= 0) G.finish("GAME_OVER", reason);
  };
  G.finish = (state, reason = "") => {
    if (![P.STATES.PLAYING, P.STATES.PAUSED].includes(G.state)) return;
    G.state = state;
    P.state.gameState = state;
    G.result = {
      state,
      reason,
      score: G.score,
      combo: G.bestCombo,
      modeId: G.modeId,
      elapsed: G.elapsed,
    };
    const save = P.state.save;
    const previous = save.records[G.modeId] || 0,
      isRecord = G.score > previous;
    if (isRecord) save.records[G.modeId] = G.score;
    save.stats.bestScore = Math.max(save.stats.bestScore || 0, G.score);
    if (state === "VICTORY") {
      P.Progression.event("wins", 1, G.modeId);
      if (G.modeId === "boss" || G.storyBoss)
        P.Progression.event("bosses", 1, G.modeId);
      if (G.modeId === "story") {
        save.story.stars[G.storyStage] = Math.max(
          save.story.stars[G.storyStage] || 0,
          G.score >= G.storyGoal + 60 ? 3 : 2,
        );
        save.story.stage = Math.max(save.story.stage, G.storyStage + 1);
      }
      if (G.modeId === "boss") G.bossNumber++;
      P.Audio.play("win");
    } else if (state === "GAME_OVER") {
      P.Audio.play("lose");
    } else P.Audio.play("win");
    let reward = Math.max(8, Math.floor(G.score / 18));
    if (P.Skills.has("coins")) reward = Math.ceil(reward * 1.2);
    save.profile.coins += reward;
    P.Progression.grantXP(
      Math.max(
        5,
        Math.floor(G.score / 5) +
          (P.Skills.has("xp") ? Math.floor(G.score / 50) : 0),
      ),
    );
    save.stats.playSeconds += Math.floor(G.elapsed);
    save.stats.modeBest = save.stats.modeBest || {};
    save.stats.modeBest[G.modeId] = Math.max(
      save.stats.modeBest[G.modeId] || 0,
      G.score,
    );
    P.Achievements.update();
    P.Storage.save();
    P.state.screen = "game";
    P.Audio.setScene("menu");
    P.UI.showResult({
      ...G.result,
      reward,
      isRecord,
      storyStage: G.storyStage,
      bossNumber: G.bossNumber,
    });
    P.emit("gameend", G.result);
  };
  G.returnMenu = () => {
    G.state = P.STATES.MENU;
    P.state.gameState = G.state;
    P.Audio.setScene("menu");
    P.state.screen = "home";
    P.UI.hideOverlay();
    P.UI.render();
  };
  G.nextBoss = () => {
    const number = G.bossNumber;
    G.start("boss", { boss: number });
  };
  G.updateHUD = () => P.UI.updateHUD();
})();
