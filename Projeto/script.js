// ==========================================================================
// 1. REGISTRO DO SERVICE WORKER
// ==========================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registrado com sucesso!', reg.scope))
      .catch(err => console.error('Erro ao registrar o Service Worker:', err));
  });
}

// Lógica do botão de instalação direta
let deferredPrompt;
const installAppBtn = document.getElementById("installAppBtn");
const installInstruction = document.getElementById("installInstruction");

// Captura o evento do Android/Chrome
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

// Força o botão a ficar visível nas Configurações de qualquer maneira!
if (installAppBtn) {
  installAppBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Instalação: ${outcome}`);
      deferredPrompt = null;
    } else {
      // Se o navegador esconder o instalador, ele ensina o usuário a achar o botão nativo do Chrome
      alert("Para instalar como App:\n\n1. Clique nos 3 pontinhos do Chrome (canto superior direito).\n2. Clique em 'Instalar aplicativo' ou 'Adicionar à tela inicial'.");
    }
  });
}

window.addEventListener('appinstalled', () => {
  if (installAppBtn) installAppBtn.textContent = "✅ Aplicativo Instalado";
});

// ==========================================================================
// 2. SELEÇÃO DE ELEMENTOS DO DOM
// ==========================================================================
const screens = {
  splash: document.getElementById("splashScreen"),
  menu: document.getElementById("menuScreen"),
  players: document.getElementById("playerScreen"),
  game: document.getElementById("gameScreen"),
  settings: document.getElementById("settingsScreen"),
};

const playerList = document.getElementById("playerList");
const emptyPlayerLabel = document.getElementById("emptyPlayerLabel");
const addPlayerModal = document.getElementById("playerModal");
const newPlayerName = document.getElementById("newPlayerName");
const currentPlayerName = document.getElementById("currentPlayerName");
const categoryGrid = document.getElementById("categoryGrid");
const matchScores = document.getElementById("matchScores");
const overallScores = document.getElementById("overallScores");

const startGameBtn = document.getElementById("startGameBtn");
const settingsBtn = document.getElementById("settingsBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");
const backToPlayersBtn = document.getElementById("backToPlayersBtn");
const backToMenuFromSettingsBtn = document.getElementById("backToMenuFromSettingsBtn");
const addPlayerModalBtn = document.getElementById("addPlayerModalBtn");
const cancelAddPlayerBtn = document.getElementById("cancelAddPlayerBtn");
const confirmAddPlayerBtn = document.getElementById("confirmAddPlayerBtn");
const goToMatchBtn = document.getElementById("goToMatchBtn");
const scoreSelectModal = document.getElementById("scoreSelectModal");
const scoreSelectTitle = document.getElementById("scoreSelectTitle");
const scoreSelectOptions = document.getElementById("scoreSelectOptions");
const closeScoreSelectBtn = document.getElementById("closeScoreSelectBtn");
const victoryModal = document.getElementById("victoryModal");
const victoryPlayerName = document.getElementById("victoryPlayerName");
const continueBtn = document.getElementById("continueBtn");
const prevPlayerBtn = document.getElementById("prevPlayerBtn");
const nextPlayerBtn = document.getElementById("nextPlayerBtn");

const themeLightBtn = document.getElementById("themeLightBtn");
const themeDarkBtn = document.getElementById("themeDarkBtn");
const matchHistoryList = document.getElementById("matchHistoryList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

let currentModalCategoryIndex = null;
let currentViewedPlayerIndex = 0;
let players = [];
let matchHistory = [];
let currentPlayerIndex = 0;

const categories = [
  { name: "Ás" }, { name: "Duque" }, { name: "Terno" },
  { name: "Quadra" }, { name: "Quina" }, { name: "Sena" },
  { name: "Fu" }, { name: "Seguida" }, { name: "Quadrada" }, { name: "General" }
];

const displayOrder = [0, 6, 3, 1, 7, 4, 2, 8, 5, 9];

// ==========================================================================
// 3. PERSISTÊNCIA DE DADOS (LOCALSTORAGE)
// ==========================================================================
function savePlayersToStorage() {
  localStorage.setItem("bozo_players", JSON.stringify(players));
}

function loadPlayersFromStorage() {
  const saved = localStorage.getItem("bozo_players");
  if (saved) {
    try {
      players = JSON.parse(saved);
      players.forEach(player => {
        player.scores = Array(categories.length).fill(null);
      });
    } catch (e) { players = []; }
  }
}

function loadHistory() {
  const saved = localStorage.getItem("bozo_history");
  matchHistory = saved ? JSON.parse(saved) : [];
  renderHistoryList();
}

function saveMatchToHistory(winnerName, score) {
  const date = new Date();
  const formattedDate = `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')} - ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  matchHistory.unshift({ winner: winnerName, score: score, date: formattedDate });
  localStorage.setItem("bozo_history", JSON.stringify(matchHistory));
  renderHistoryList();
}

function renderHistoryList() {
  if (!matchHistoryList) return;
  matchHistoryList.innerHTML = "";
  if (!matchHistory.length) {
    matchHistoryList.innerHTML = `<div class="history-empty">Nenhuma partida registrada</div>`;
    return;
  }
  matchHistory.forEach(item => {
    matchHistoryList.innerHTML += `
      <div class="history-item">
        <div class="history-meta">
          <span>🏆 Vencedor</span>
          <span>${item.date}</span>
        </div>
        <div class="history-details">
          <span>${item.winner}</span>
          <span style="color: var(--color-primary);">${item.score} Pts</span>
        </div>
      </div>`;
  });
}

// ==========================================================================
// 4. GERENCIAMENTO DE INTERFACE E TEMAS
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem("bozo_theme") || "dark";
  setTheme(savedTheme);
}

function setTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light-theme");
    themeLightBtn.classList.add("active");
    themeDarkBtn.classList.remove("active");
  } else {
    document.body.classList.remove("light-theme");
    themeLightBtn.classList.remove("active");
    themeDarkBtn.classList.add("active");
  }
  localStorage.setItem("bozo_theme", theme);
}

function showScreen(screenKey) {
  Object.values(screens).forEach((screen) => { if(screen) screen.classList.add("hidden"); });
  if (screens[screenKey]) screens[screenKey].classList.remove("hidden");
}

function updatePlayerList() {
  playerList.innerHTML = "";
  if (!players.length) {
    emptyPlayerLabel.classList.remove("hidden");
    return;
  }
  emptyPlayerLabel.classList.add("hidden");
  players.forEach((player, index) => {
    const item = document.createElement("div");
    item.className = "player-item";
    item.innerHTML = `<span class="player-name">${player.name}</span>`;
    
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-player-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", (e) => { e.stopPropagation(); removePlayer(index); });
    
    item.appendChild(deleteBtn);
    item.addEventListener("click", () => {
      currentPlayerIndex = index;
      currentViewedPlayerIndex = index;
      syncGameScreen();
      showScreen("game");
    });
    playerList.appendChild(item);
  });
}

// ==========================================================================
// 5. MECÂNICAS DA TABELA DO BOZÓ
// ==========================================================================
function createCategoryGrid() {
  categoryGrid.innerHTML = "";
  const gridPositions = {
    0: { col: 1, row: 1 }, 1: { col: 1, row: 2 }, 2: { col: 1, row: 3 },
    6: { col: 2, row: 1 }, 7: { col: 2, row: 2 }, 8: { col: 2, row: 3 }, 9: { col: 2, row: 4 },
    3: { col: 3, row: 1 }, 4: { col: 3, row: 2 }, 5: { col: 3, row: 3 }
  };

  displayOrder.forEach((categoryIndex) => {
    const category = categories[categoryIndex];
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "category-cell";
    
    const pos = gridPositions[categoryIndex];
    if (pos) {
      cell.style.gridColumn = String(pos.col);
      cell.style.gridRow = String(pos.row);
    }
    
    const score = players[currentViewedPlayerIndex]?.scores[categoryIndex];
    let scoreDisplay = "";
    if (typeof score === "number" && score > 0) {
      scoreDisplay = String(score);
    } else if (score === "X") {
      scoreDisplay = '<span style="color: #dc2626;">✕</span>';
    }
    
    cell.innerHTML = `<div class="category-title">${category.name}</div><div class="category-score">${scoreDisplay}</div>`;
    cell.addEventListener("click", () => {
      currentPlayerIndex = currentViewedPlayerIndex; 
      openScoreSelectModal(categoryIndex);
    });
    categoryGrid.appendChild(cell);
  });
}

function openScoreSelectModal(categoryIndex) {
  currentModalCategoryIndex = categoryIndex;
  const category = categories[categoryIndex];
  scoreSelectTitle.textContent = `Pontuação: ${category.name}`;
  scoreSelectOptions.innerHTML = "";

  const options = getCategoryRange(category.name);
  options.forEach((value) => {
    const opt = document.createElement("button");
    opt.className = "select-option";
    opt.textContent = String(value);
    opt.addEventListener("click", () => { assignScore(value, categoryIndex); closeScoreSelectModal(); });
    scoreSelectOptions.appendChild(opt);
  });

  const nullo = document.createElement("button");
  nullo.className = "select-option";
  nullo.textContent = "0 (Nulo)";
  nullo.addEventListener("click", () => { assignScore(0, categoryIndex); closeScoreSelectModal(); });
  scoreSelectOptions.appendChild(nullo);

  const risc = document.createElement("button");
  risc.className = "select-option danger-option";
  risc.textContent = "✕ Riscar";
  risc.addEventListener("click", () => { assignScore("X", categoryIndex); closeScoreSelectModal(); });
  scoreSelectOptions.appendChild(risc);

  scoreSelectModal.classList.remove("hidden");
}

function closeScoreSelectModal() { scoreSelectModal.classList.add("hidden"); }
function showPreviousPlayer() { currentViewedPlayerIndex = (currentViewedPlayerIndex - 1 + players.length) % players.length; currentPlayerIndex = currentViewedPlayerIndex; syncGameScreen(); }
function showNextPlayer() { currentViewedPlayerIndex = (currentViewedPlayerIndex + 1) % players.length; currentPlayerIndex = currentViewedPlayerIndex; syncGameScreen(); }

function getCategoryRange(categoryName) {
  switch (categoryName) {
    case "Ás": return [1, 2, 3, 4, 5];
    case "Duque": return [2, 4, 6, 8, 10];
    case "Terno": return [3, 6, 9, 12, 15];
    case "Quadra": return [4, 8, 12, 16, 20];
    case "Quina": return [5, 10, 15, 20, 25];
    case "Sena": return [6, 12, 18, 24, 30];
    case "Fu": return [10, 15];
    case "Seguida": return [20, 25];
    case "Quadrada": return [30, 35];
    case "General": return [40, 100];
    default: return [0];
  }
}

function syncGameScreen() {
  const pName = players[currentViewedPlayerIndex] ? players[currentViewedPlayerIndex].name : "JOGADOR";
  currentPlayerName.textContent = pName;
  createCategoryGrid();
  renderScores();
}

function renderScores() {
  matchScores.innerHTML = ""; overallScores.innerHTML = "";
  const sortedByMatch = [...players].sort((a, b) => calculateTotal(b.scores) - calculateTotal(a.scores));
  const sortedByOverall = [...players].sort((a, b) => b.vitorias - a.vitorias);

  sortedByMatch.forEach((p) => {
    matchScores.innerHTML += `<div class="score-item"><span>${p.name}</span><span>${calculateTotal(p.scores)}</span></div>`;
  });
  sortedByOverall.forEach((p) => {
    overallScores.innerHTML += `<div class="score-item"><span>${p.name}</span><span>${p.vitorias}</span></div>`;
  });
}

function isGameComplete() {
  if (!players.length) return false;
  return players.every(player => player.scores.every(score => score !== null));
}

// ... (Resto do código omitido por espaço, mantendo a estrutura original sem alterações nas funções abaixo)