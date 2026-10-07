# PULSE RUSH

Jogo arcade 2D com React na interface e Canvas/JavaScript no motor de jogo.

## Desenvolvimento

Requer Node.js 20.19+ ou 22.12+.

```sh
npm install
npm run dev
```

Para gerar os arquivos estáticos de publicação:

```sh
npm run build
npm run preview
```

## Arquitetura

- `src/App.jsx`: shell, navegação, carteira, modais e toasts.
- `src/Screens.jsx`: telas da aplicação em componentes React.
- `src/GameScreen.jsx`: HUD React e canvas estável; recebe atualizações do HUD por eventos, não por frame.
- `src/actions.js`: ações e navegação da interface.
- `js/game.js`: máquina de estados, único `requestAnimationFrame`, arena e regras da partida.
- `js/physics.js`: movimento, ricochete, colisão e rastros.
- `js/storage.js`: save local versionado, migração e renovação de ciclos.
- `js/modes.js`, `js/skills.js`, `js/shop.js`, `js/missions.js`, `js/achievements.js` e `js/progression.js`: sistemas de jogo independentes.
- `js/ui.js`: eventos entre o motor e a interface React.

## Save e controles

O save permanece em `localStorage` sob a chave `pulseRush.save`, com a mesma versão e migração existentes. Clique ou toque nos orbes para marcar pontos e evite os alvos vermelhos. `Esc` ou `Espaço` pausa e retoma; o jogo pausa quando a aba fica oculta.
