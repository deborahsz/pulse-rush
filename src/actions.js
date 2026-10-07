const P = window.Pulse;

function navigate(screen) {
  P.UI.hideOverlay();
  P.Game.state = P.STATES.MENU;
  P.state.gameState = P.STATES.MENU;
  P.state.screen = screen;
  P.Audio.setScene("menu");
  P.UI.render();
}

function handleAction(name) {
  if (name === "nav:more") return P.UI.showMoreNavigation();
  if (name === "nav:close") return P.UI.hideOverlay();
  if (name.startsWith("screen:")) return navigate(name.slice(7));
  if (name === "pause") return P.Game.pause();
  if (name === "resume") return P.Game.resume();
  if (name === "menu") return P.Game.returnMenu();
  if (name === "retry")
    return P.Game.start(P.Game.modeId, {
      stage: P.Game.storyStage,
      boss: P.Game.bossNumber,
    });
  if (name === "bossnext") return P.Game.nextBoss();
  if (name === "storynext")
    return P.Game.start("story", { stage: P.state.save.story.stage });
  if (name === "story:start")
    return P.Game.start("story", { stage: P.state.save.story.stage });
  if (name.startsWith("claim:")) {
    const [, period, id] = name.split(":");
    return P.Missions.claim(period, id);
  }
  if (name.startsWith("missions:")) {
    P.state.missionTab = name.split(":")[1];
    return P.UI.render();
  }
  if (name.startsWith("pass:track:")) {
    P.state.passTrack = name.split(":")[2];
    return P.UI.render();
  }
  if (name.startsWith("pass:claim:")) {
    const [, , track, level] = name.split(":");
    return P.Progression.claimPassReward(track, Number(level));
  }
  if (name.startsWith("skill:")) return P.Skills.equip(name.slice(6));
  if (name.startsWith("skillbuy:")) {
    const id = name.slice(9);
    const skill = P.Skills.find((item) => item.id === id);
    if (!skill) return;
    if (P.state.save.profile.coins < skill.unlock) {
      P.UI.toast("Moedas insuficientes.");
      return;
    }
    P.state.save.profile.coins -= skill.unlock;
    P.state.save.inventory.skills.push(id);
    P.Storage.save();
    P.UI.toast(skill.name + " desbloqueada. Equipe no Pulse Lab.");
    return P.UI.render();
  }
  if (name.startsWith("achievement:"))
    return P.Achievements.claim(name.slice(12));
  if (name.startsWith("buy:")) return P.Shop.buy(name.slice(4));
  if (name.startsWith("equip:")) return P.Shop.equip(name.slice(6));
  if (name.startsWith("shopfilter:")) {
    P.state.shopCategory = name.slice(11);
    return P.UI.render();
  }
  if (name.startsWith("rank:")) {
    P.state.rankMode = name.slice(5);
    return P.UI.render();
  }
  if (name === "profile:edit") {
    const value = window.prompt("Como quer ser chamado?", P.state.save.profile.name);
    if (value?.trim()) {
      P.state.save.profile.name = value.trim().slice(0, 18);
      P.Storage.save();
      P.UI.render();
    }
  }
}

export function handleAppClick(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const mode = target.closest("[data-mode]")?.dataset.mode;
  if (mode) return P.Game.start(mode);

  const stage = target.closest("[data-stage]")?.dataset.stage;
  if (stage) return P.Game.start("story", { stage: Number(stage) });

  const action = target.closest("[data-action]")?.dataset.action;
  if (action) return handleAction(action);

  const screen = target.closest("[data-screen]")?.dataset.screen;
  if (screen) navigate(screen);
}