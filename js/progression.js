(function () {
  const P = window.Pulse;
  P.Progression = {
    grantXP(amount) {
      const save = P.state.save;
      const profile = save.profile;
      profile.xp += Math.round(amount);
      let threshold = profile.level * 100;
      while (profile.xp >= threshold) {
        profile.xp -= threshold;
        profile.level++;
        profile.coins += 75;
        threshold = profile.level * 100;
        P.UI.toast("Nível " + profile.level + "! +75 moedas");
      }
      save.season.xp += Math.round(amount);
      P.Storage.save();
    },
    seasonDay() {
      return Math.min(
        30,
        Math.floor((Date.now() - P.state.save.season.startedAt) / 86400000) + 1,
      );
    },
    claimPassReward(track, level) {
      const season = P.state.save.season;
      const claimed = season.claimed[track];
      const requiredXP = level * 150;
      if (!claimed || level < 1 || level > 20) return;
      if (track !== "free" && !season.tracks[track]) {
        P.UI.toast(
          "Esta trilha será ativada quando o Pulse Pass premium estiver disponível.",
        );
        return;
      }
      if (season.xp < requiredXP || claimed.includes(level)) return;
      claimed.push(level);
      if (track === "free") {
        P.state.save.profile.coins += 20 + level * 5;
      } else if (level % 4 === 0) {
        const itemId = `pass-${track}-${level / 4}`;
        if (!P.Shop.owned(itemId)) P.state.save.inventory.owned.push(itemId);
      } else {
        P.state.save.profile.coins += 40 + level * 8;
      }
      P.Storage.save();
      P.Audio.play("reward");
      P.UI.toast("Recompensa do Pulse Pass coletada.");
      P.UI.render();
    },
    event(type, value = 1, mode) {
      P.Storage.cycle();
      const stats = P.state.save.stats;
      if (type === "combo") stats.bestCombo = Math.max(stats.bestCombo, value);
      else stats[type] = (stats[type] || 0) + value;
      if (mode && type === "games") {
        stats.modePlays = stats.modePlays || {};
        stats.modePlays[mode] = (stats.modePlays[mode] || 0) + value;
      }
      P.Missions.record(type, value, mode);
      P.Achievements.update();
      P.Storage.save();
    },
  };
})();
