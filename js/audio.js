(function () {
  const P = window.Pulse;
  let context = null,
    master = null,
    ambient = null,
    ambientGain = null,
    scene = "menu";
  function ensure() {
    if (context) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = P.state.save?.settings.sound === false ? 0 : 0.17;
    master.connect(context.destination);
  }
  const notes = {
    hit: [620, 0.055, "sine"],
    combo: [880, 0.09, "triangle"],
    miss: [145, 0.12, "sawtooth"],
    hazard: [110, 0.2, "square"],
    win: [740, 0.28, "triangle"],
    lose: [170, 0.32, "sawtooth"],
    reward: [980, 0.13, "sine"],
    boss: [220, 0.18, "triangle"],
  };
  P.Audio = {
    play(name) {
      if (P.state.save?.settings.sound === false) return;
      ensure();
      if (!context) return;
      if (context.state === "suspended") context.resume();
      const [frequency, duration, wave] = notes[name] || notes.hit,
        osc = context.createOscillator(),
        gain = context.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(frequency, context.currentTime);
      if (name === "hit")
        osc.frequency.exponentialRampToValueAtTime(
          frequency * 1.5,
          context.currentTime + duration,
        );
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + duration,
      );
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      osc.stop(context.currentTime + duration + 0.02);
    },
    setScene(next) {
      scene = next;
      if (!P.state.save?.settings.music || next === "game") {
        this.stopAmbient();
        return;
      }
      ensure();
      if (!context || ambient) return;
      if (context.state === "suspended") context.resume();
      ambient = context.createOscillator();
      ambientGain = context.createGain();
      ambient.type = "sine";
      ambient.frequency.value =
        next === "boss" ? 68 : next === "menu" ? 82 : 74;
      ambientGain.gain.value = 0.018;
      ambient.connect(ambientGain);
      ambientGain.connect(master);
      ambient.start();
    },
    stopAmbient() {
      if (ambient) {
        try {
          ambient.stop();
        } catch {}
        ambient.disconnect();
        ambient = null;
        ambientGain?.disconnect();
        ambientGain = null;
      }
    },
    get scene() {
      return scene;
    },
  };
})();
