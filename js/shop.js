(function () {
  const P = window.Pulse;
  P.Shop = P.Shop || {};
  P.Shop.items = [
    {
      id: "core-cyan",
      name: "Núcleo Ciano",
      category: "orb",
      rarity: "básico",
      cost: 0,
      color: "#50e7f4",
      symbol: "●",
    },
    {
      id: "core-rose",
      name: "Núcleo Solar",
      category: "orb",
      rarity: "comum",
      cost: 180,
      color: "#ff6aa9",
      symbol: "●",
    },
    {
      id: "core-void",
      name: "Núcleo do Vazio",
      category: "orb",
      rarity: "épico",
      cost: 520,
      color: "#a582ff",
      symbol: "◉",
    },
    {
      id: "core-nova",
      name: "Nova Dourada",
      category: "orb",
      rarity: "lendário",
      cost: 1100,
      color: "#ffd16b",
      symbol: "✦",
    },
    {
      id: "trail-comet",
      name: "Rastro Cometa",
      category: "trail",
      rarity: "básico",
      cost: 0,
      color: "#50e7f4",
      symbol: "〰",
    },
    {
      id: "trail-aurora",
      name: "Rastro Aurora",
      category: "trail",
      rarity: "épico",
      cost: 420,
      color: "#76f0bc",
      symbol: "〰",
    },
    {
      id: "aura-pulse",
      name: "Aura Pulse",
      category: "aura",
      rarity: "básico",
      cost: 0,
      color: "#50e7f4",
      symbol: "◎",
    },
    {
      id: "aura-crown",
      name: "Coroa Estelar",
      category: "aura",
      rarity: "lendário",
      cost: 900,
      color: "#ffd16b",
      symbol: "✧",
    },
    {
      id: "burst-prism",
      name: "Estouro Prisma",
      category: "burst",
      rarity: "comum",
      cost: 240,
      color: "#a582ff",
      symbol: "✳",
    },
    {
      id: "burst-supernova",
      name: "Supernova",
      category: "burst",
      rarity: "exclusivo",
      cost: 1500,
      color: "#ffd16b",
      symbol: "✹",
    },
    ...[
      ["pass-silver-1", "Rastro Lunar", "trail", "#c7d4ef", "〰"],
      ["pass-silver-2", "Aura Boreal", "aura", "#8ae2d5", "◎"],
      ["pass-silver-3", "Núcleo Prismático", "orb", "#b6a4ff", "◉"],
      ["pass-silver-4", "Estouro Celeste", "burst", "#a9ccff", "✳"],
      ["pass-silver-5", "Cometa Prateado", "trail", "#d9def8", "〰"],
      ["pass-gold-1", "Coroa Solar", "aura", "#ffd16b", "✧"],
      ["pass-gold-2", "Núcleo Eclipse", "orb", "#ffba7a", "✦"],
      ["pass-gold-3", "Rastro Supernova", "trail", "#ffca75", "〰"],
      ["pass-gold-4", "Explosão Dourada", "burst", "#ffe29a", "✹"],
      ["pass-gold-5", "Orbe de Aurora", "orb", "#ffc98c", "◉"],
    ].map(([id, name, category, color, symbol], index) => ({
      id,
      name,
      category,
      rarity: index < 5 ? "épico" : "lendário",
      cost: 0,
      color,
      symbol,
      source: index < 5 ? "silver" : "gold",
    })),
  ];
  P.Shop.owned = (id) => P.state.save.inventory.owned.includes(id);
  P.Shop.buy = (id) => {
    const item = P.Shop.items.find((entry) => entry.id === id),
      s = P.state.save;
    if (!item || item.source || P.Shop.owned(id)) return;
    if (s.profile.coins < item.cost) {
      P.UI.toast("Moedas insuficientes.");
      return;
    }
    s.profile.coins -= item.cost;
    s.inventory.owned.push(id);
    P.Storage.save();
    P.Audio.play("reward");
    P.UI.toast(item.name + " adquirido.");
    P.UI.render();
  };
  P.Shop.equip = (id) => {
    const item = P.Shop.items.find((entry) => entry.id === id),
      s = P.state.save;
    if (!item || !P.Shop.owned(id)) return;
    s.inventory.equipped[item.category] = id;
    P.Storage.save();
    P.UI.toast(item.name + " equipado.");
    P.UI.render();
  };
  P.Shop.equipped = (id) =>
    Object.values(P.state.save.inventory.equipped).includes(id);
})();
