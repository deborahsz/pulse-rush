(function () {
  const P = window.Pulse;
  P.state.save = P.Storage.load();
  P.Storage.cycle();

  document.addEventListener("keydown", (event) => {
    if (event.code === "Escape") {
      if (P.Game.state === P.STATES.PLAYING) P.Game.pause();
      else if (P.Game.state === P.STATES.PAUSED) P.Game.resume();
    }
    if (event.code === "Space" && P.Game.state === P.STATES.PLAYING) {
      event.preventDefault();
      P.Game.pause();
    }
  });

  window.addEventListener("resize", () => {
    if (P.state.screen === "game") P.Game.resize();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && P.Game.state === P.STATES.PLAYING) P.Game.pause();
  });

  function frame(now) {
    P.Game.frame(now);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
