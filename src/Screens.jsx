import React from "react";

const P = window.Pulse;

function PageTitle({ eyebrow, title, description }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

function ActionButton({ action, children, className = "" }) {
  return (
    <button className={`btn ${className}`} data-action={action}>
      {children}
    </button>
  );
}

function record(id) {
  return P.format(P.state.save.records[id] || 0);
}

function Home() {
  const profile = P.state.save.profile;
  const needed = profile.level * 100;
  const daily = P.Missions.daily.filter(
    (mission) => !P.state.save.missions.daily[mission.id]?.claimed,
  ).length;
  const modes = [
    ["classic", "CLÁSSICO", `60 s · melhor: ${record("classic")}`, "◉"],
    [
      "infinite",
      "RUSH INFINITO",
      `Sem limite · melhor: ${record("infinite")}`,
      "∞",
    ],
    ["hundred", "100 TOQUES", "Acerte os 100 alvos", "◎"],
    ["boss", "BOSS MODE", "Chefes em movimento", "✦"],
  ];

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">PULSE ALWAYS ON</div>
          <h1 className="hero-title">
            PULSE
            <br />
            <span>RUSH</span>
          </h1>
          <div className="hero-tagline">Jogue • Evolua • Supere</div>
          <div className="hero-sub">
            SUA PRÓXIMA MELHOR PARTIDA COMEÇA AGORA
          </div>
          <div className="hero-actions">
            <ActionButton
              action="screen:play"
              className="btn-primary hero-play"
            >
              ▶ &nbsp; JOGAR
            </ActionButton>
            <ActionButton action="screen:story" className="btn-quiet">
              ◈ &nbsp; HISTÓRIA
            </ActionButton>
          </div>
        </div>
        <div className="hero-stat">
          SEU NÍVEL
          <b>{String(profile.level).padStart(2, "0")}</b>
        </div>
      </section>
      <div className="home-grid">
        <section>
          <h2 className="section-label">ACESSO RÁPIDO</h2>
          <div className="mode-grid">
            {modes.map(([id, name, description, icon]) => (
              <button className="mode-card" data-mode={id} key={id}>
                <span className="mode-icon">{icon}</span>
                <span className="mode-record">REC. {record(id)}</span>
                <h3>{name}</h3>
                <p>{description}</p>
              </button>
            ))}
          </div>
          <div className="feature-grid">
            <button className="feature-card" data-screen="missions">
              <span className="feature-icon">☷</span>
              <h3>MISSÕES</h3>
              <p>{daily} objetivos aguardando</p>
            </button>
            <button className="feature-card" data-screen="lab">
              <span className="feature-icon">◈</span>
              <h3>PULSE LAB</h3>
              <p>Skills, conquistas e coleção</p>
            </button>
          </div>
        </section>
        <aside className="home-side">
          <section className="panel">
            <h2 className="panel-title">
              JORNADA <span className="eyebrow">LV. {profile.level}</span>
            </h2>
            <div className="xp-head">
              <span>XP para nível {profile.level + 1}</span>
              <b>
                {P.format(profile.xp)} / {P.format(needed)}
              </b>
            </div>
            <div className="progress-track">
              <i
                style={{
                  width: `${Math.min(100, (profile.xp / needed) * 100)}%`,
                }}
              />
            </div>
            <div className="mission-line">
              <span>Estágios concluídos</span>
              <b>{P.state.save.story.stage - 1} / 1.000</b>
            </div>
            <div className="progress-track">
              <i style={{ width: `${(P.state.save.story.stage - 1) / 10}%` }} />
            </div>
          </section>
          <section className="panel xp-panel">
            <h2 className="panel-title">
              PULSO DO DIA{" "}
              <span style={{ color: "var(--gold)" }}>
                ✦ {P.format(profile.coins)}
              </span>
            </h2>
            <p className="small muted">
              {daily} missões ainda podem render moedas.
            </p>
            <ActionButton action="screen:missions" className="btn-small">
              VER MISSÕES →
            </ActionButton>
          </section>
        </aside>
      </div>
    </>
  );
}

function PlayHub() {
  const categories = [
    [
      "story",
      "⌁",
      "HISTÓRIA",
      "1.000 estágios em uma jornada que muda a cada pulso.",
    ],
    [
      "arcade",
      "✳",
      "ARCADE",
      "Modos curtos, recordes separados e ritmo sem pausa.",
    ],
    [
      "lab",
      "◈",
      "PULSE LAB",
      "Skills, conquistas e o seu códice de descobertas.",
    ],
    [
      "missions",
      "☷",
      "MISSÕES",
      "Objetivos diários e semanais com recompensas.",
    ],
  ];
  return (
    <>
      <PageTitle
        eyebrow="CENTRAL DE JOGO"
        title="Escolha seu caminho"
        description="Quatro frentes. Uma arena. Seu recorde está esperando."
      />
      <div className="category-grid">
        {categories.map(([screen, icon, name, description]) => (
          <button
            className="feature-card category-card"
            data-screen={screen}
            key={screen}
          >
            <span className="large-icon">{icon}</span>
            <h2>{name}</h2>
            <p>{description}</p>
            <span className="arrow">→</span>
          </button>
        ))}
      </div>
    </>
  );
}

const arcadeIcons = {
  classic: "◉",
  survival: "♥",
  hundred: "◎",
  frantic: "ϟ",
  infinite: "∞",
  boss: "✦",
};

function Arcade() {
  return (
    <>
      <PageTitle
        eyebrow="SELEÇÃO DE MODO"
        title="ARCADE"
        description="Cada modo tem seu próprio recorde. Qual vai ser?"
      />
      <div className="arcade-grid">
        {P.modeCards.map(([id, name, description]) => (
          <button className="panel arcade-card" data-mode={id} key={id}>
            <span className="mode-icon">{arcadeIcons[id]}</span>
            <h3>{name.toUpperCase()}</h3>
            <p>{description}</p>
            <span className="record-pill">
              SEU RECORDE <b>{record(id)}</b>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function Story() {
  const stage = P.state.save.story.stage;
  return (
    <>
      <PageTitle
        eyebrow="CAMPANHA · 1.000 ESTÁGIOS"
        title="A longa jornada"
        description="Cada estágio revela um novo ritmo. Sua jornada é salva automaticamente."
      />
      <section className="panel story-feature">
        <div>
          <b>ESTÁGIO {String(stage).padStart(3, "0")}</b>
          <div className="small muted">
            {P.format(stage - 1)} estágios concluídos
          </div>
        </div>
        <ActionButton action="story:start" className="btn-primary">
          CONTINUAR →
        </ActionButton>
      </section>
      <div className="screen-scroll">
        <div className="story-map">
          {Array.from({ length: 1000 }, (_, index) => {
            const number = index + 1;
            const unlocked = number <= stage;
            const stars = P.state.save.story.stars[number] || 0;
            const status =
              number < stage
                ? "★".repeat(stars)
                : number === stage
                  ? "ATUAL"
                  : "🔒";
            const objective =
              number % 5 === 0
                ? "NÚCLEO GUARDIÃO"
                : number % 3 === 0
                  ? "COMBO · PRECISÃO"
                  : "ALVO · REFLEXO";
            return (
              <div className="story-stage" key={number}>
                <button
                  className={`stage-node ${number === stage ? "current" : ""} ${unlocked ? "" : "locked"}`}
                  data-stage={unlocked ? number : undefined}
                  disabled={!unlocked}
                >
                  <span className="stage-status">{status}</span>
                  <strong>ESTÁGIO {String(number).padStart(3, "0")}</strong>
                  <small>
                    {objective} · META {number * 20 + 80} PTS
                  </small>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Missions() {
  const period = P.state.missionTab === "daily" ? "daily" : "weekly";
  const list = period === "daily" ? P.Missions.daily : P.Missions.weekly;
  const bucket = P.state.save.missions[period];
  return (
    <>
      <PageTitle
        eyebrow="RECOMPENSAS"
        title="Missões"
        description="Complete objetivos em jogo e resgate moedas uma vez por ciclo."
      />
      <div className="missions-tabs">
        <button
          className={`tab-btn ${period === "daily" ? "active" : ""}`}
          data-action="missions:daily"
        >
          DIÁRIAS · 7
        </button>
        <button
          className={`tab-btn ${period === "weekly" ? "active" : ""}`}
          data-action="missions:weekly"
        >
          SEMANAIS · 10
        </button>
      </div>
      <div className="mission-list">
        {list.map((mission) => {
          const progress = Math.min(
            mission.target,
            P.Missions.value(mission, period),
          );
          const claimed = bucket[mission.id]?.claimed;
          const ready = progress >= mission.target;
          return (
            <article className="mission-card" key={mission.id}>
              <div>
                <h3>{mission.name}</h3>
                <p>
                  {P.format(progress)} / {P.format(mission.target)} ·{" "}
                  <span className="mission-reward">✦ {mission.reward}</span>
                </p>
                <div className="progress-track">
                  <i
                    style={{ width: `${(progress / mission.target) * 100}%` }}
                  />
                </div>
              </div>
              {claimed ? (
                <span className="muted small">COLETADA</span>
              ) : (
                <ActionButton
                  action={`claim:${period}:${mission.id}`}
                  className={ready ? "btn-gold btn-small" : "btn-small"}
                >
                  {ready ? "COLETAR" : "EM JOGO"}
                </ActionButton>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}

function PulseLab() {
  const owned = P.state.save.inventory.skills;
  const equipped = P.state.save.inventory.equippedSkills;
  return (
    <>
      <PageTitle
        eyebrow="PROGRESSÃO"
        title="PULSE LAB"
        description="Configure até três Skills. Cada uma altera uma regra real da arena."
      />
      <div className="split-layout">
        <section className="panel">
          <h2 className="panel-title">
            SKILLS EQUIPADAS{" "}
            <span className="eyebrow">{equipped.length} / 3</span>
          </h2>
          <div className="skill-slots">
            {[0, 1, 2].map((slot) => {
              const skill = P.Skills.find(
                (entry) => entry.id === equipped[slot],
              );
              return (
                <div
                  className={`skill-slot ${skill ? "filled" : ""}`}
                  key={slot}
                >
                  {skill?.name || "SLOT LIVRE"}
                </div>
              );
            })}
          </div>
          <div className="skill-list">
            {P.Skills.map((skill) => {
              const unlocked = owned.includes(skill.id);
              const active = equipped.includes(skill.id);
              const canUnlock = P.state.save.profile.coins >= skill.unlock;
              return (
                <div className="skill-row" key={skill.id}>
                  <div>
                    <h3>{skill.name}</h3>
                    <p>{skill.description}</p>
                  </div>
                  {unlocked ? (
                    <ActionButton
                      action={`skill:${skill.id}`}
                      className={`btn-small ${active ? "btn-primary" : ""}`}
                    >
                      {active ? "EQUIPADA" : "EQUIPAR"}
                    </ActionButton>
                  ) : (
                    <ActionButton
                      action={`skillbuy:${skill.id}`}
                      className={`btn-small ${canUnlock ? "btn-gold" : ""}`}
                    >
                      ✦ {skill.unlock}
                    </ActionButton>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        <div>
          <section className="panel">
            <h2 className="panel-title">
              CONQUISTAS{" "}
              <span className="eyebrow">
                {
                  Object.values(P.state.save.achievements).filter(
                    (entry) => entry.claimed,
                  ).length
                }{" "}
                / 99
              </span>
            </h2>
            <p className="small muted">
              99 metas persistentes. Resgate cada recompensa uma vez.
            </p>
            <div className="achievement-list">
              {P.Achievements.list.slice(0, 15).map((item) => {
                const entry = P.state.save.achievements[item.id];
                const progress =
                  item.metric === "codex"
                    ? P.state.save.codex.length
                    : P.state.save.stats[item.metric] || 0;
                return (
                  <div className="achievement-row" key={item.id}>
                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        {item.category} · {Math.min(progress, item.target)} /{" "}
                        {item.target} · ✦ {item.reward}
                      </p>
                    </div>
                    {entry?.claimed ? (
                      <span className="muted small">OK</span>
                    ) : entry?.unclaimed ? (
                      <ActionButton
                        action={`achievement:${item.id}`}
                        className="btn-small btn-gold"
                      >
                        COLETAR
                      </ActionButton>
                    ) : (
                      <span className="muted small">
                        {Math.floor((progress / item.target) * 100)}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <ActionButton
              action="screen:achievements"
              className="btn-small btn-quiet"
            >
              VER 99 CONQUISTAS →
            </ActionButton>
          </section>
          <section className="panel" style={{ marginTop: 14 }}>
            <h2 className="panel-title">
              PULSE PASS{" "}
              <span className="eyebrow">
                DIA {P.Progression.seasonDay()} / 30
              </span>
            </h2>
            <p className="small muted">
              XP de temporada por partida. Trilha grátis sempre ativa.
            </p>
            <ActionButton action="screen:pass" className="btn-small">
              ABRIR PULSE PASS →
            </ActionButton>
          </section>
        </div>
      </div>
    </>
  );
}

function Achievements() {
  return (
    <>
      <PageTitle
        eyebrow="MARCO A MARCO"
        title="Conquistas"
        description="99 objetivos em reflexo, combos, modos, coleção e chefes."
      />
      <div className="achievement-list">
        {P.Achievements.list.map((item) => {
          const entry = P.state.save.achievements[item.id];
          const progress =
            item.metric === "codex"
              ? P.state.save.codex.length
              : P.state.save.stats[item.metric] || 0;
          return (
            <div className="achievement-row" key={item.id}>
              <div>
                <h3>{item.name}</h3>
                <p>
                  {item.category} · {Math.min(progress, item.target)} /{" "}
                  {item.target} · ✦ {item.reward}
                </p>
              </div>
              {entry?.claimed ? (
                <span className="muted small">CONCLUÍDA</span>
              ) : entry?.unclaimed ? (
                <ActionButton
                  action={`achievement:${item.id}`}
                  className="btn-small btn-gold"
                >
                  COLETAR
                </ActionButton>
              ) : (
                <span className="muted small">
                  {Math.floor((progress / item.target) * 100)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Shop() {
  const filter = P.state.shopCategory || "all";
  const categories = [
    ["all", "TODOS"],
    ["orb", "NÚCLEOS"],
    ["trail", "RASTROS"],
    ["aura", "AURAS"],
    ["burst", "EXPLOSÕES"],
  ];
  return (
    <>
      <PageTitle
        eyebrow="PERSONALIZAÇÃO"
        title="LOJA"
        description="Cosméticos equipáveis. Uma escolha ativa por categoria."
      />
      <div className="missions-tabs">
        {categories.map(([id, label]) => (
          <button
            className={`tab-btn ${filter === id ? "active" : ""}`}
            data-action={`shopfilter:${id}`}
            key={id}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="shop-grid">
        {P.Shop.items
          .filter((item) => filter === "all" || item.category === filter)
          .map((item) => {
            const owned = P.Shop.owned(item.id);
            const equipped = P.Shop.equipped(item.id);
            const visualClass = ["lendário", "exclusivo"].includes(item.rarity)
              ? "legendary"
              : item.rarity === "épico"
                ? "epic"
                : "";
            const categoryClass = item.category === "orb" ? "orb-visual" : "";
            const categoryName = {
              orb: "Núcleo",
              trail: "Rastro",
              aura: "Aura",
              burst: "Explosão",
            }[item.category];
            return (
              <article className="item-card" key={item.id}>
                <span className={`rarity ${item.rarity}`}>{item.rarity}</span>
                <div
                  className={`item-visual ${visualClass} ${categoryClass}`}
                  style={{ color: item.color }}
                >
                  {item.symbol}
                </div>
                <h3>{item.name}</h3>
                <p>
                  {categoryName} · {item.rarity}
                </p>
                {equipped ? (
                  <button className="btn btn-small" disabled>
                    EQUIPADO
                  </button>
                ) : owned ? (
                  <ActionButton
                    action={`equip:${item.id}`}
                    className="btn-small btn-primary"
                  >
                    EQUIPAR
                  </ActionButton>
                ) : item.source ? (
                  <button className="btn btn-small" disabled>
                    PULSE PASS {item.source.toUpperCase()}
                  </button>
                ) : (
                  <ActionButton
                    action={`buy:${item.id}`}
                    className={`btn-small ${item.cost ? "btn-gold" : ""}`}
                  >
                    ✦ {item.cost}
                  </ActionButton>
                )}
              </article>
            );
          })}
      </div>
    </>
  );
}

function Collection() {
  const discovered = P.state.save.codex;
  const colors = ["#50e7f4", "#ff75b8", "#a582ff", "#76f0bc", "#ffd16b"];
  const symbols = ["●", "◉", "✦", "◎", "✧"];
  return (
    <>
      <PageTitle
        eyebrow="REGISTRO DE DESCOBERTAS"
        title="Códice de orbes"
        description="Vinte frequências catalogáveis, separadas do seu equipamento cosmético."
      />
      <div className="codex-grid">
        {Array.from({ length: 20 }, (_, index) => {
          const known = discovered.includes(
            index === 0 ? "cyan" : `orb-${index}`,
          );
          return (
            <div className="codex-slot" key={index}>
              <div>
                <span
                  className="codex-orb"
                  style={{
                    color: known ? colors[index % colors.length] : "#41506a",
                  }}
                >
                  {known ? symbols[index % symbols.length] : "?"}
                </span>
                <small>
                  {known
                    ? `FREQUÊNCIA ${String(index + 1).padStart(2, "0")}`
                    : "NÃO DESCOBERTO"}
                </small>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Rankings() {
  const selected = P.state.rankMode || "classic";
  const fake = [
    ["Nova_07", 9840],
    ["KiraPulse", 8420],
    ["zeroG", 7710],
    ["Lumen", 6240],
    ["runner_88", 5120],
  ];
  return (
    <>
      <PageTitle
        eyebrow="PLACAR LOCAL"
        title="Ranking"
        description="Recordes isolados por modo. Placar local preparado para integração online."
      />
      <div className="missions-tabs">
        {Object.keys(P.Modes).map((id) => (
          <button
            className={`tab-btn ${selected === id ? "active" : ""}`}
            data-action={`rank:${id}`}
            key={id}
          >
            {P.Modes[id].name.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="rank-list panel">
        {fake.map(([name, score], index) => (
          <div className="rank-row" key={name}>
            <b className="rank-pos">{String(index + 1).padStart(2, "0")}</b>
            <span className="rank-name">{name}</span>
            <b className="rank-score">{P.format(score)}</b>
          </div>
        ))}
        <div className="rank-row">
          <b className="rank-pos">YOU</b>
          <span className="rank-name">{P.state.save.profile.name}</span>
          <b className="rank-score">{record(selected)}</b>
        </div>
      </div>
    </>
  );
}

function Profile() {
  const save = P.state.save;
  const stats = save.stats;
  const values = [
    ["MELHOR PONTUAÇÃO", stats.bestScore || 0],
    ["PONTOS SOMADOS", stats.score],
    ["TOQUES TOTAIS", stats.taps],
    ["MAIOR COMBO", stats.bestCombo],
    ["PARTIDAS", stats.games],
    ["VITÓRIAS", stats.wins],
    ["CHEFES", stats.bosses],
    ["ESTÁGIOS", save.story.stage - 1],
    ["ITENS", save.inventory.owned.length],
  ];
  return (
    <>
      <PageTitle
        eyebrow="SEU PULSO"
        title="Perfil"
        description="Sua jornada, suas marcas, seus recordes."
      />
      <section className="panel profile-hero">
        <div className="profile-avatar">
          {save.profile.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="profile-name">{save.profile.name}</div>
          <div className="profile-level">
            NÍVEL {save.profile.level} · {P.format(save.profile.xp)} XP · ✦{" "}
            {P.format(save.profile.coins)}
          </div>
        </div>
        <ActionButton action="profile:edit" className="btn-small btn-quiet">
          EDITAR NOME
        </ActionButton>
      </section>
      <div className="stats-grid">
        {values.map(([label, value]) => (
          <div className="stat-box" key={label}>
            <b>{P.format(value)}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <section className="panel">
        <h2 className="panel-title">RECORDES POR MODO</h2>
        <div className="rank-list">
          {Object.keys(P.Modes).map((id) => (
            <div className="rank-row" key={id}>
              <span className="rank-name">{P.Modes[id].name}</span>
              <b className="rank-score">{record(id)}</b>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function PulsePass() {
  const day = P.Progression.seasonDay();
  const xp = P.state.save.season.xp;
  const track = P.state.passTrack || "free";
  const season = P.state.save.season;
  const tracks = [
    ["free", "GRÁTIS"],
    ["silver", "PRATA"],
    ["gold", "OURO"],
  ];
  const enabled = track === "free" || season.tracks[track];
  return (
    <>
      <PageTitle
        eyebrow="TEMPORADA · 30 DIAS"
        title="PULSE PASS"
        description="Progrida em três trilhas. A trilha grátis já está ativa; premium sem pagamento nesta versão."
      />
      <section className="pass-hero">
        <div className="eyebrow">
          TEMPORADA{" "}
          {new Date(season.startedAt)
            .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
            .toUpperCase()}
        </div>
        <h2>O pulso não para.</h2>
        <div className="small muted">
          Dia {day} de 30 · {P.format(xp)} XP de temporada
        </div>
        <div className="progress-track" style={{ marginTop: 14 }}>
          <i style={{ width: `${Math.min(100, (xp / 3000) * 100)}%` }} />
        </div>
      </section>
      <div className="missions-tabs" style={{ marginTop: 18 }}>
        {tracks.map(([id, label]) => (
          <button
            className={`tab-btn ${track === id ? "active" : ""}`}
            data-action={`pass:track:${id}`}
            key={id}
          >
            {label}
            {id !== "free" && !season.tracks[id] ? " · BLOQUEADA" : ""}
          </button>
        ))}
      </div>
      <div className="pass-track">
        {Array.from({ length: 20 }, (_, index) => {
          const level = index + 1;
          const needed = level * 150;
          const unlocked = xp >= needed;
          const claimed = season.claimed[track].includes(level);
          const reward =
            track === "free"
              ? `✦ ${20 + level * 5} moedas`
              : index % 4 === 3
                ? track === "silver"
                  ? "Cosmético épico"
                  : "Cosmético lendário"
                : `✦ ${40 + level * 8} moedas + bônus`;
          const status = claimed
            ? "COLETADA"
            : !enabled
              ? "TRILHA BLOQUEADA"
              : unlocked
                ? "COLETAR"
                : `${P.format(needed)} XP`;
          return (
            <div className="pass-reward" key={level}>
              <b>
                NÍVEL {String(level).padStart(2, "0")}{" "}
                {claimed ? "✓" : unlocked ? "◈" : "·"}
              </b>
              {reward}
              <div className="small muted" style={{ marginTop: 7 }}>
                {status}
              </div>
              {!claimed && enabled && unlocked && (
                <ActionButton
                  action={`pass:claim:${track}:${level}`}
                  className="btn-small btn-gold"
                >
                  COLETAR
                </ActionButton>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function ScreenRouter({ screen }) {
  const views = {
    home: Home,
    play: PlayHub,
    arcade: Arcade,
    story: Story,
    missions: Missions,
    lab: PulseLab,
    achievements: Achievements,
    shop: Shop,
    collection: Collection,
    rankings: Rankings,
    profile: Profile,
    pass: PulsePass,
  };
  const Screen = views[screen] || Home;
  return (
    <section className="page">
      <Screen />
    </section>
  );
}
