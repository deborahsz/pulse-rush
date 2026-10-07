(function () {
  const P = window.Pulse;
  const names = [
    "Primeiro Pulso",
    "Aquecimento",
    "Olho de Águia",
    "Reflexo Relâmpago",
    "Combo Inicial",
    "Em Chamas",
    "Sem Errar",
    "Caçador de Recordes",
    "Viciado em Arcade",
    "Mestre da Precisão",
    "Sobrevivente",
    "Velocidade Pura",
    "Centenário",
    "Lenda do Rush",
    "Colecionador",
    "Mil Toques",
    "Pulso Perfeito",
  ];
  const list = Array.from({ length: 99 }, (_, index) => {
    const tier = Math.floor(index / names.length);
    return {
      id: "ach-" + (index + 1),
      name: tier
        ? names[index % names.length] + " " + (tier + 1)
        : names[index % names.length],
      category: ["Reflexo", "Combos", "Modos", "Coleção", "Chefes"][index % 5],
      target: Math.max(1, (tier + 1) * [1, 10, 25, 50, 100, 250][index % 6]),
      metric: ["taps", "bestCombo", "games", "codex", "bosses"][index % 5],
      reward: 15 + index * 2,
    };
  });

  P.Achievements = {
    list,
    update() {
      const save = P.state.save;
      for (const item of list) {
        if (save.achievements[item.id]?.claimed) continue;
        const progress =
          item.metric === "codex"
            ? save.codex.length
            : save.stats[item.metric] || 0;
        if (progress >= item.target)
          save.achievements[item.id] = { progress, unclaimed: true };
      }
    },
    claim(id) {
      const status = P.state.save.achievements[id];
      if (!status?.unclaimed) return;
      const item = list.find((entry) => entry.id === id);
      status.claimed = true;
      status.unclaimed = false;
      P.state.save.profile.coins += item.reward;
      P.Storage.save();
      P.UI.toast("Conquista: " + item.name + " · +" + item.reward + " moedas");
      P.UI.render();
    },
  };
})();
