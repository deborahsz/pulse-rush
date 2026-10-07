import "../js/state.js";
import "../js/storage.js";
import "../js/modes.js";
import "../js/skills.js";
import "../js/shop.js";
import "../js/progression.js";
import "../js/missions.js";
import "../js/achievements.js";
import "../js/physics.js";
import "../js/audio.js";
import "../js/game.js";
import "../js/ui.js";
import "../js/main.js";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
