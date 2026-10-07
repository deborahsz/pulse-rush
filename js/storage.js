(function () {
  const P = window.Pulse;
  const KEY = "pulseRush.save";
  const today = () => Math.floor(Date.now() / 86400000);
  const week = () => Math.floor((Date.now() / 86400000 + 3) / 7);
  const defaults = () => ({
    version: 2,
    profile: { name: "Runner", xp: 0, level: 1, coins: 250 },
    story: { stage: 1, stars: {} },
    records: {},
    stats: {
      taps: 0,
      bestCombo: 0,
      games: 0,
      wins: 0,
      bosses: 0,
      score: 0,
      playSeconds: 0,
      skillsUsed: 0,
    },
    inventory: {
      owned: ["core-cyan"],
      equipped: {
        orb: "core-cyan",
        trail: "trail-comet",
        aura: "aura-pulse",
        burst: "burst-prism",
      },
      skills: ["safety-net", "time-bend", "lucky-star"],
      equippedSkills: [],
    },
    codex: ["cyan"],
    missions: {
      dailyCycle: today(),
      weeklyCycle: week(),
      daily: {},
      weekly: {},
    },
    achievements: {},
    season: {
      startedAt: Date.now(),
      xp: 0,
      premium: false,
      tracks: { silver: false, gold: false },
      claimed: { free: [], silver: [], gold: [] },
    },
    settings: { sound: true, music: false, playerName: "Runner" },
  });
  function migrate(raw) {
    const base = defaults();
    if (!raw || typeof raw !== "object") return base;
    if (raw.version === 1) {
      raw.profile = raw.profile || {};
      raw.stats = raw.stats || {};
      raw.version = 2;
    }
    return {
      ...base,
      ...raw,
      profile: { ...base.profile, ...raw.profile },
      story: { ...base.story, ...raw.story },
      records: { ...base.records, ...raw.records },
      stats: { ...base.stats, ...raw.stats },
      inventory: {
        ...base.inventory,
        ...raw.inventory,
        equipped: { ...base.inventory.equipped, ...raw.inventory?.equipped },
        owned: Array.isArray(raw.inventory?.owned)
          ? raw.inventory.owned
          : base.inventory.owned,
        skills: Array.isArray(raw.inventory?.skills)
          ? raw.inventory.skills
          : base.inventory.skills,
        equippedSkills: Array.isArray(raw.inventory?.equippedSkills)
          ? raw.inventory.equippedSkills
          : [],
      },
      missions: { ...base.missions, ...raw.missions },
      achievements: { ...base.achievements, ...raw.achievements },
      season: {
        ...base.season,
        ...raw.season,
        tracks: { ...base.season.tracks, ...raw.season?.tracks },
        claimed: { ...base.season.claimed, ...raw.season?.claimed },
      },
      settings: { ...base.settings, ...raw.settings },
    };
  }
  function load() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "null");
      return migrate(value);
    } catch {
      return defaults();
    }
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(P.state.save));
    } catch {
      P.UI?.toast("Não foi possível salvar neste navegador.");
    }
  }
  function cycle() {
    const s = P.state.save;
    if (s.missions.dailyCycle !== today()) {
      s.missions.dailyCycle = today();
      s.missions.daily = {};
    }
    if (s.missions.weeklyCycle !== week()) {
      s.missions.weeklyCycle = week();
      s.missions.weekly = {};
    }
    const seasonLength = 30 * 86400000;
    const elapsed = Date.now() - s.season.startedAt;
    if (elapsed >= seasonLength) {
      s.season = {
        startedAt:
          s.season.startedAt +
          Math.floor(elapsed / seasonLength) * seasonLength,
        xp: 0,
        premium: false,
        tracks: { silver: false, gold: false },
        claimed: { free: [], silver: [], gold: [] },
      };
    }
  }
  P.Storage = { load, save, defaults, cycle };
})();
