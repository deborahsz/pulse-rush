(function () {
  const P = window.Pulse;
  let toastId = 0;

  P.UI = {
    render() {
      P.Storage.cycle();
      P.emit("ui-change");
    },
    updateHUD() {
      P.emit("hud-change");
    },
    showMoreNavigation() {
      this.modal("more-navigation");
    },
    showPause() {
      this.modal("pause");
    },
    showResult(result) {
      this.modal("result", result);
      this.render();
    },
    modal(type, data = null) {
      P.state.overlay = { type, data };
      P.emit("overlay-change");
    },
    hideOverlay() {
      if (!P.state.overlay) return;
      P.state.overlay = null;
      P.emit("overlay-change");
    },
    toast(message) {
      const toast = { id: ++toastId, message };
      P.state.toasts.push(toast);
      P.emit("toast-change");
      window.setTimeout(() => {
        P.state.toasts = P.state.toasts.filter((item) => item.id !== toast.id);
        P.emit("toast-change");
      }, 2600);
    },
  };
})();
