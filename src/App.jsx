import React from "react";
import GameScreen from "./GameScreen.jsx";
import ScreenRouter from "./Screens.jsx";
import { handleAppClick } from "./actions.js";
import { usePulseEvent } from "./signals.js";

const P = window.Pulse;

const navigation = [
  ["home", "⌂", "Início"],
  ["play", "▶", "Jogar"],
  ["story", "⌁", "História"],
  ["arcade", "✳", "Arcade"],
  ["missions", "☷", "Missões"],
  ["divider"],
  ["lab", "◈", "Pulse Lab"],
  ["shop", "◇", "Loja"],
  ["collection", "◉", "Códice"],
  ["rankings", "≋", "Ranking"],
  ["profile", "◎", "Perfil"],
  ["pass", "▤", "Pulse Pass"],
  ["more", "···", "Mais"],
];

const moreAreas = [
  ["story", "HISTÓRIA", "⌁"],
  ["arcade", "ARCADE", "✳"],
  ["lab", "PULSE LAB", "◈"],
  ["collection", "CÓDICE", "◉"],
  ["rankings", "RANKING", "≋"],
  ["profile", "PERFIL", "◎"],
  ["pass", "PULSE PASS", "▤"],
];

function Wallet() {
  usePulseEvent("ui-change");
  usePulseEvent("hud-change");
  const profile = P.state.save.profile;
  return (
    <div className="topbar-right">
      <span className="currency">
        <span className="coin-icon">✦</span>
        <b>{P.format(profile.coins)}</b>
      </span>
      <button className="profile-chip" data-screen="profile">
        <span className="avatar">{profile.name.slice(0, 1).toUpperCase()}</span>
        <span>NV. {profile.level}</span>
      </button>
    </div>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <button
        className="wordmark"
        data-screen="home"
        aria-label="Ir para o início"
      >
        <span className="brand-mark">P</span>
        <span>
          PULSE <b>RUSH</b>
          <small>PULSE ALWAYS ON</small>
        </span>
      </button>
      <Wallet />
    </header>
  );
}

function SideNavigation({ screen }) {
  const moreScreens = [
    "story",
    "arcade",
    "lab",
    "collection",
    "rankings",
    "profile",
    "pass",
    "achievements",
  ];
  return (
    <nav className="side-nav" aria-label="Navegação principal">
      {navigation.map(([id, icon, label]) => {
        if (id === "divider")
          return <div className="nav-divider" key="divider" />;
        const isMore = id === "more";
        const active = isMore
          ? moreScreens.includes(screen)
          : screen === id ||
            ((screen === "game" || screen === "arcade") && id === "play");
        return (
          <button
            className={`nav-link ${isMore ? "nav-more" : ""} ${active ? "active" : ""}`}
            data-screen={isMore ? undefined : id}
            data-action={isMore ? "nav:more" : undefined}
            key={id}
          >
            <span>{icon}</span>
            {label}
          </button>
        );
      })}
      <div className="nav-footer">
        <span className="live-dot" /> PULSE ALWAYS ON
      </div>
    </nav>
  );
}

function Overlay() {
  usePulseEvent("overlay-change");
  const overlay = P.state.overlay;
  if (!overlay) return null;

  let content;
  if (overlay.type === "pause") {
    content = (
      <>
        <div className="eyebrow">PAUSA</div>
        <h2>Respire. O pulso espera.</h2>
        <p>O tempo, a física e os perigos estão congelados.</p>
        <div className="dialog-actions">
          <button className="btn btn-primary" data-action="resume">
            ▶ &nbsp; CONTINUAR
          </button>
          <button className="btn btn-quiet" data-action="menu">
            ⌂ &nbsp; SAIR PARA O MENU
          </button>
        </div>
      </>
    );
  } else if (overlay.type === "result") {
    const result = overlay.data;
    const won = result.state === "VICTORY";
    const boss = result.modeId === "boss";
    const story = result.modeId === "story";
    const label = won
      ? "VITÓRIA"
      : result.state === "GAME_OVER"
        ? "DERROTA"
        : "RESULTADO";
    const retryLabel =
      result.state === "GAME_OVER" ? "TENTAR NOVAMENTE" : "JOGAR DE NOVO";
    content = (
      <>
        <div className="eyebrow">
          {won
            ? "PULSO PERFEITO"
            : result.state === "GAME_OVER"
              ? "FIM DE JOGO"
              : "SESSÃO ENCERRADA"}
        </div>
        <h2>{label}</h2>
        <div className="result-score">{P.format(result.score)}</div>
        <div className="small muted">
          PONTOS {result.isRecord ? "· NOVO RECORDE" : ""}
        </div>
        <div className="dialog-stats">
          <span>
            COMBO MÁX.<b>{result.combo}×</b>
          </span>
          <span>
            TEMPO<b>{Math.floor(result.elapsed)}s</b>
          </span>
          <span>
            RECOMPENSA<b>✦ {result.reward}</b>
          </span>
        </div>
        <p>
          {result.reason ? `${result.reason} · ` : ""}
          {result.isRecord
            ? "Esse agora é o seu melhor recorde."
            : "Sua próxima tentativa começa no menu."}{" "}
          XP, progresso e moedas salvos.
        </p>
        <div className="dialog-actions">
          {boss && won ? (
            <button className="btn btn-primary" data-action="bossnext">
              PRÓXIMO BOSS →
            </button>
          ) : story && won ? (
            <button className="btn btn-primary" data-action="storynext">
              PRÓXIMO ESTÁGIO →
            </button>
          ) : (
            <button className="btn btn-primary" data-action="retry">
              {retryLabel}
            </button>
          )}
          <button className="btn btn-quiet" data-action="menu">
            ⌂ &nbsp; MENU
          </button>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <div className="eyebrow">PULSE RUSH</div>
        <h2>MAIS ÁREAS</h2>
        <div className="more-nav-grid">
          {moreAreas.map(([screen, label, icon]) => (
            <button className="btn btn-quiet" data-screen={screen} key={screen}>
              {icon} &nbsp; {label}
            </button>
          ))}
        </div>
        <button className="btn btn-small" data-action="nav:close">
          FECHAR
        </button>
      </>
    );
  }

  return (
    <div className="overlay">
      <section className="dialog" role="dialog" aria-modal="true">
        {content}
      </section>
    </div>
  );
}

function ToastRegion() {
  usePulseEvent("toast-change");
  return (
    <div className="toast-region" aria-live="polite">
      {P.state.toasts.map((toast) => (
        <div className="toast" key={toast.id}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  usePulseEvent("ui-change");
  const screen = P.state.screen;

  return (
    <div className="app-shell" onClick={handleAppClick}>
      <TopBar />
      <SideNavigation screen={screen} />
      <main id="app" tabIndex={-1}>
        {screen === "game" ? <GameScreen /> : <ScreenRouter screen={screen} />}
      </main>
      <ToastRegion />
      <Overlay />
    </div>
  );
}
