import React, { useLayoutEffect, useRef } from "react";
import { usePulseEvent } from "./signals.js";

const P = window.Pulse;

function GameHud() {
  usePulseEvent("hud-change");
  const game = P.Game;
  const timer = game.config?.duration
    ? `${Math.ceil(game.remaining)}s`
    : `♥ ${game.lives === Infinity ? "∞" : game.lives}`;

  return (
    <header className="game-hud">
      <div>
        <div className="eyebrow">PULSE ALWAYS ON</div>
        <div className="hud-mode">{game.config?.short || "ARENA"}</div>
      </div>
      <div className="hud-stats">
        <div className="hud-stat">
          <span>{game.modeId === "hundred" ? "PROGRESSO" : "PONTOS"}</span>
          <b>
            {game.modeId === "hundred"
              ? `${game.taps}/100`
              : P.format(game.score)}
          </b>
        </div>
        <div className="hud-stat combo">
          <span>COMBO</span>
          <b>{game.combo}×</b>
        </div>
        <div className="hud-stat">
          <span>{game.config?.duration ? "TEMPO" : "VIDAS"}</span>
          <b>{timer}</b>
        </div>
      </div>
      <button className="btn btn-small" data-action="pause" aria-label="Pausar">
        Ⅱ
      </button>
    </header>
  );
}

function ArenaCanvas() {
  const canvasRef = useRef(null);

  useLayoutEffect(() => {
    P.Game.mountArena();
    return () => {
      if (P.Game.ctx === canvasRef.current?.getContext("2d")) P.Game.ctx = null;
    };
  }, []);

  return (
    <canvas
      id="arena"
      ref={canvasRef}
      aria-label="Arena de jogo. Toque nos alvos luminosos e evite os vermelhos."
      onPointerDown={(event) => P.Game.hit(event.clientX, event.clientY)}
    />
  );
}

export default function GameScreen() {
  const game = P.Game;
  const arenaClass =
    game.modeId === "infinite" || game.modeId === "boss" || game.storyBoss
      ? `mode-${game.modeId === "story" ? "boss" : game.modeId}`
      : "";

  return (
    <section className="game-page">
      <GameHud />
      <div className={`arena-wrap ${arenaClass}`}>
        <ArenaCanvas />
      </div>
      <footer className="game-controls">
        <span>
          {game.modeId === "boss" || game.storyBoss
            ? `BOSS ${game.bossNumber} · ${game.bossName} · HP ${game.bossHP}/${game.bossMaxHP}`
            : "TOQUE NOS ORBES · EVITE O VERMELHO"}
        </span>
        <span className="skill-hud">
          {P.state.save.inventory.equippedSkills.map((id) => (
            <span className="skill-tag" key={id}>
              {P.Skills.find((skill) => skill.id === id)?.name || ""}
            </span>
          ))}
        </span>
      </footer>
    </section>
  );
}
