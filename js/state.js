(function () {
  const P = (window.Pulse = window.Pulse || {});
  P.STATES = Object.freeze({
    MENU: "MENU",
    PLAYING: "PLAYING",
    PAUSED: "PAUSED",
    RESULT: "RESULT",
    GAME_OVER: "GAME_OVER",
  });
  P.state = {
    screen: "home",
    gameState: P.STATES.MENU,
    save: null,
    missionTab: "daily",
    notice: null,
    overlay: null,
    toasts: [],
  };
  P.esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  P.clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  P.format = (value) => Math.floor(value || 0).toLocaleString("pt-BR");
  P.emit = (name, detail = {}) =>
    window.dispatchEvent(new CustomEvent("pulse:" + name, { detail }));
})();
