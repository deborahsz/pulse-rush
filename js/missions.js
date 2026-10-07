(function () {
  const P = window.Pulse;
  const daily = [
    ["tap-20", "Toque 20 alvos", "taps", 20, 35],
    ["combo-8", "Faça combo 8", "combo", 8, 45],
    ["play-one", "Jogue uma partida", "games", 1, 30],
    ["score-500", "Marque 500 pontos", "score", 500, 45],
    ["survive", "Jogue Sobrevivência", "survival", 1, 40],
    ["skill-one", "Use uma Skill", "skills", 1, 40],
    ["tap-50", "Toque 50 alvos", "taps", 50, 55],
  ];
  const weekly = [
    ["tap-500", "Toque 500 alvos", "taps", 500, 180],
    ["combo-25", "Faça combo 25", "combo", 25, 220],
    ["win-10", "Vença 10 partidas", "wins", 10, 200],
    ["score-5000", "Marque 5.000 pontos", "score", 5000, 250],
    ["boss-3", "Derrote 3 chefes", "bosses", 3, 300],
    ["play-20", "Jogue 20 partidas", "games", 20, 180],
    ["frantic-5", "Jogue Frenético 5 vezes", "frantic", 5, 210],
    [
      "survival-300",
      "Faça 300 pontos em Sobrevivência",
      "survivalScore",
      300,
      250,
    ],
    ["use-10", "Use Skills 10 vezes", "skills", 10, 180],
    ["tap-1000", "Toque 1.000 alvos", "taps", 1000, 350],
  ];

  P.Missions = {
    daily: daily.map(([id, name, type, target, reward]) => ({
      id,
      name,
      type,
      target,
      reward,
    })),
    weekly: weekly.map(([id, name, type, target, reward]) => ({
      id,
      name,
      type,
      target,
      reward,
    })),
    value(mission, period = "daily") {
      return P.state.save.missions[period][mission.id]?.progress || 0;
    },
    record(type, value, mode) {
      P.Storage.cycle();
      const save = P.state.save;
      for (const period of ["daily", "weekly"]) {
        const missions = period === "daily" ? this.daily : this.weekly;
        for (const mission of missions) {
          const matches =
            mission.type === type ||
            (mission.type === "survival" &&
              type === "games" &&
              mode === "survival") ||
            (mission.type === "frantic" &&
              type === "games" &&
              mode === "frantic") ||
            (mission.type === "survivalScore" &&
              type === "score" &&
              mode === "survival");
          if (!matches) continue;
          const entry = save.missions[period][mission.id] || { progress: 0 };
          entry.progress =
            type === "combo"
              ? Math.max(entry.progress, value)
              : entry.progress + value;
          save.missions[period][mission.id] = entry;
        }
      }
    },
    claim(period, id) {
      P.Storage.cycle();
      const missions = period === "daily" ? this.daily : this.weekly;
      const mission = missions.find((entry) => entry.id === id);
      const bucket = P.state.save.missions[period];
      if (
        !mission ||
        bucket[id]?.claimed ||
        this.value(mission, period) < mission.target
      )
        return;
      bucket[id] = { ...bucket[id], claimed: true };
      P.state.save.profile.coins += mission.reward;
      P.Storage.save();
      P.Audio.play("reward");
      P.UI.toast("+" + mission.reward + " moedas coletadas!");
      P.UI.render();
    },
  };
})();
