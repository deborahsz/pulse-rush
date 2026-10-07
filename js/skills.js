(function () {
  const P = window.Pulse;
  const base = [
    ["safety-net", "Rede de Segurança", "Anula um erro por partida.", "shield"],
    [
      "time-bend",
      "Dobra do Tempo",
      "Clássico e Frenético: +5 segundos.",
      "time",
    ],
    ["lucky-star", "Estrela da Sorte", "+20% de moedas ao concluir.", "coins"],
    ["overdrive", "Sobrecarga", "Acertos valem +15% de pontos.", "scoreBonus"],
    [
      "red-ward",
      "Guarda Rubra",
      "Sobrevive ao primeiro alvo vermelho.",
      "hazard",
    ],
    [
      "slow-field",
      "Campo Lento",
      "A velocidade dos alvos cai por 4 s após combo 10.",
      "slow",
    ],
    [
      "combo-core",
      "Núcleo de Combo",
      "Combo começa com multiplicador 2x.",
      "combo",
    ],
    [
      "second-wind",
      "Segundo Fôlego",
      "Recupera uma vida ao chegar a 25 acertos.",
      "heal",
    ],
    [
      "magnet-touch",
      "Toque Magnético",
      "Raio de acerto aumentado em 8 px.",
      "radius",
    ],
    [
      "echo-strike",
      "Golpe Eco",
      "A cada 12 acertos, bônus de 5 pontos.",
      "echo",
    ],
    [
      "hot-streak",
      "Sequência Quente",
      "Cada combo 5+ concede 2 moedas.",
      "coins",
    ],
    [
      "focus-mode",
      "Foco Absoluto",
      "A primeira penalidade de erro é ignorada.",
      "focus",
    ],
    [
      "pulse-shield",
      "Escudo Pulse",
      "Protege de um perigo no Rush Infinito.",
      "hazardShield",
    ],
    ["quick-charge", "Carga Rápida", "+10% de XP por partida.", "xp"],
    [
      "star-catcher",
      "Caçador de Estrelas",
      "Primeiro acerto vale +10 pontos.",
      "firstHit",
    ],
    [
      "boss-breaker",
      "Quebra-Chefes",
      "Dano ao chefe aumentado em 20%.",
      "boss",
    ],
    [
      "afterimage",
      "Pós-Imagem",
      "Rastro reforçado revela o caminho do alvo.",
      "trail",
    ],
    [
      "life-link",
      "Elo Vital",
      "Começa Sobrevivência com uma vida extra.",
      "life",
    ],
    ["coin-rush", "Chuva de Moedas", "+1 moeda a cada 10 acertos.", "coins"],
    [
      "steady-hand",
      "Mão Firme",
      "Ignora a primeira quebra de combo.",
      "steady",
    ],
    [
      "prism-surge",
      "Surto Prismático",
      "A cada 20 acertos, pontuação 2x por 5 s.",
      "surge",
    ],
    [
      "last-light",
      "Última Luz",
      "Abaixo de 20 s, alvos ficam maiores.",
      "radius",
    ],
  ];
  P.Skills = base.map(([id, name, description, effect], index) => ({
    id,
    name,
    description,
    effect,
    unlock: index < 3 ? 0 : 100 + index * 85,
  }));
  P.Skills.active = (id) =>
    P.Skills.find(
      (skill) =>
        skill.id === id && P.state.save.inventory.equippedSkills.includes(id),
    );
  P.Skills.has = (effect) =>
    P.state.save.inventory.equippedSkills.some(
      (id) => P.Skills.find((skill) => skill.id === id)?.effect === effect,
    );
  P.Skills.equip = (id) => {
    const inventory = P.state.save.inventory;
    if (!inventory.skills.includes(id)) {
      P.UI.toast("Desbloqueie esta Skill antes de equipar.");
      return;
    }
    if (inventory.equippedSkills.includes(id)) {
      inventory.equippedSkills = inventory.equippedSkills.filter(
        (skill) => skill !== id,
      );
      P.UI.toast("Skill removida do equipamento.");
    } else if (inventory.equippedSkills.length < 3) {
      inventory.equippedSkills.push(id);
      P.UI.toast("Skill equipada.");
    } else {
      P.UI.toast("Máximo de 3 Skills equipadas.");
      return;
    }
    P.Storage.save();
    P.UI.render();
  };
})();
