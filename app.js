/**
 * Quantum Tic-Tac-Toe - Game Logic and Visual Effects
 */

// --- STATE MANAGEMENT ---
let boardState = Array(9).fill("");
let currentTurn = "X"; // Player 1 is always X
let gameMode = "pvp"; // "pvp" or "pve"
let aiDifficulty = "easy"; // "easy" or "hard"
let isGameActive = true;
let isAiThinking = false;
let isSoundEnabled = true;

// Scores tracking
let scores = {
  x: 0,
  o: 0,
  ties: 0
};

// Winning lines coordinate map for 300x300 viewBox
const WINNING_COMBOS = [
  { combo: [0, 1, 2], x1: 20,  y1: 50,  x2: 280, y2: 50 },  // Row 0
  { combo: [3, 4, 5], x1: 20,  y1: 150, x2: 280, y2: 150 }, // Row 1
  { combo: [6, 7, 8], x1: 20,  y1: 250, x2: 280, y2: 250 }, // Row 2
  { combo: [0, 3, 6], x1: 50,  y1: 20,  x2: 50,  y2: 280 }, // Col 0
  { combo: [1, 4, 7], x1: 150, y1: 20,  x2: 150, y2: 280 }, // Col 1
  { combo: [2, 5, 8], x1: 250, y1: 20,  x2: 250, y2: 280 }, // Col 2
  { combo: [0, 4, 8], x1: 30,  y1: 30,  x2: 270, y2: 270 }, // Diag 1
  { combo: [2, 4, 6], x1: 270, y1: 30,  x2: 30,  y2: 270 }  // Diag 2
];

// SVG Mark Templates
const SVG_MARK_X = `
  <svg class="x-svg" viewBox="0 0 100 100">
    <path d="M25 25 L75 75" stroke-dasharray="100" stroke-dashoffset="100"></path>
    <path d="M75 25 L25 75" stroke-dasharray="100" stroke-dashoffset="100"></path>
  </svg>
`;

const SVG_MARK_O = `
  <svg class="o-svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="28" stroke-dasharray="180" stroke-dashoffset="180"></circle>
  </svg>
`;

// --- DOM ELEMENTS ---
const cells = document.querySelectorAll(".cell");
const gameBoard = document.getElementById("game-board");
const winningLine = document.getElementById("winning-strike-line");
const scoreXElement = document.getElementById("score-x");
const scoreOElement = document.getElementById("score-o");
const scoreTiesElement = document.getElementById("score-ties");
const playerONameElement = document.getElementById("player-o-name");

// Scoreboard Cards
const cardX = document.querySelector(".player-x-card");
const cardO = document.querySelector(".player-o-card");

// Buttons & Controls
const modePvPBtn = document.getElementById("mode-pvp");
const modePvEBtn = document.getElementById("mode-pve");
const diffEasyBtn = document.getElementById("diff-easy");
const diffHardBtn = document.getElementById("diff-hard");
const aiDifficultyGroup = document.getElementById("ai-difficulty-group");
const soundToggleBtn = document.getElementById("sound-toggle");
const themeToggleBtn = document.getElementById("theme-toggle");
const restartBtn = document.getElementById("restart-btn");
const resetScoresBtn = document.getElementById("reset-scores-btn");

// Modal
const outcomeModal = document.getElementById("outcome-modal");
const modalTitle = document.getElementById("modal-title");
const modalSubtitle = document.getElementById("modal-subtitle");
const modalBadge = document.getElementById("modal-badge");
const modalActionBtn = document.getElementById("modal-action-btn");

// Canvas
const canvas = document.getElementById("effects-canvas");
const ctx = canvas.getContext("2d");

// --- AUDIO ENGINE (WEB AUDIO API) ---
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playSynthesizedSound(type) {
  if (!isSoundEnabled) return;
  initAudio();
  if (!audioCtx) return;
  
  // Resume context if suspended (browser behavior)
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;

  switch (type) {
    case "click": {
      // Short synthetic placement pop/plink
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
      break;
    }
    case "error": {
      // Lower buzz sound for locked/invalid moves
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
      break;
    }
    case "win": {
      // Beautiful major arpeggio play
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const startTime = now + idx * 0.08;
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.005, startTime + 0.35);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
      break;
    }
    case "tie": {
      // Sad mellow descending slide
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.35);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
      break;
    }
  }
}

// --- PARTICLE EFFECT ENGINE (CANVAS CONFETTI) ---
let particles = [];
let animationFrameId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class ConfettiParticle {
  constructor(x, y, isWinCelebration = true) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 8 + 4;
    this.color = this.getRandomColor();
    
    // Spread velocity
    const angle = Math.random() * Math.PI * 2;
    const speed = isWinCelebration ? (Math.random() * 8 + 4) : (Math.random() * 4 + 1);
    
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: isWinCelebration ? (Math.sin(angle) * speed - 5) : (Math.sin(angle) * speed)
    };
    
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 8;
    this.gravity = isWinCelebration ? 0.22 : 0.05;
    this.drag = 0.98;
    this.opacity = 1.0;
  }

  getRandomColor() {
    const colors = [
      "#6366f1", "#818cf8", // Indigos
      "#06b6d4", "#22d3ee", // Cyans
      "#a855f7", "#c084fc", // Purples
      "#ec4899", "#f472b6"  // Pinks
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.velocity.x *= this.drag;
    this.velocity.y += this.gravity;
    this.velocity.y *= this.drag;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.rotation += this.rotationSpeed;
    this.opacity -= 0.01;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    
    // Mix rectangle confetti and circle stars
    if (this.size > 8) {
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

function startConfettiExplosion(x, y) {
  // Clear any existing animation loops
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  particles = [];
  
  // Generate particles
  const count = 120;
  for (let i = 0; i < count; i++) {
    particles.push(new ConfettiParticle(x, y, true));
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles = particles.filter(p => p.opacity > 0 && p.y < canvas.height && p.x > 0 && p.x < canvas.width);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    if (particles.length > 0) {
      animationFrameId = requestAnimationFrame(animate);
    }
  }
  animate();
}

function handleAmbientCellClick(event) {
  // Create quick ripple particle splash inside the clicked cell coordinate
  const rect = event.target.getBoundingClientRect();
  const clickX = rect.left + rect.width / 2;
  const clickY = rect.top + rect.height / 2;
  
  // Make a small splash of 8 particles
  const splashParticles = [];
  for (let i = 0; i < 12; i++) {
    const p = new ConfettiParticle(clickX, clickY, false);
    splashParticles.push(p);
  }
  
  // Append to current particle queue if already running, or start a loop
  if (particles.length === 0) {
    particles = splashParticles;
    const animateSplash = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.opacity > 0);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(animateSplash);
      }
    };
    animateSplash();
  } else {
    particles.push(...splashParticles);
  }
}

// --- LOCAL STORAGE SCORES ---
function loadScores() {
  const savedScores = localStorage.getItem("quantum_ttt_scores");
  if (savedScores) {
    try {
      scores = JSON.parse(savedScores);
    } catch (e) {
      console.error("Failed to parse scoreboard cache", e);
    }
  }
  updateScoreboardDisplay();
}

function saveScores() {
  localStorage.setItem("quantum_ttt_scores", JSON.stringify(scores));
  updateScoreboardDisplay();
}

function updateScoreboardDisplay() {
  scoreXElement.textContent = scores.x;
  scoreOElement.textContent = scores.o;
  scoreTiesElement.textContent = scores.ties;
}

// --- GAMEPLAY FLOW & TURNS ---
function handleCellClick(event) {
  const cell = event.target;
  const index = parseInt(cell.getAttribute("data-index"));

  // Check if cell is filled or game is locked
  if (boardState[index] !== "" || !isGameActive || isAiThinking) {
    playSynthesizedSound("error");
    cell.classList.add("shake");
    setTimeout(() => cell.classList.remove("shake"), 400);
    return;
  }

  // Make ripple particles
  handleAmbientCellClick(event);

  // Play move
  makeMove(index, currentTurn);
}

function makeMove(index, player) {
  boardState[index] = player;
  const cell = cells[index];
  
  // Render SVG marking
  cell.innerHTML = player === "X" ? SVG_MARK_X : SVG_MARK_O;
  
  // Force a browser reflow/layout so stroke-dashoffset transition functions
  const path = cell.querySelector("path, circle");
  path.getBoundingClientRect();
  path.classList.add("draw-active");
  
  // Remove hover indicators
  cell.classList.remove("preview-x", "preview-o");
  
  playSynthesizedSound("click");
  
  // Check Win or Draw condition
  if (checkWin(boardState, player)) {
    endGame(player);
    return;
  }
  
  if (checkDraw(boardState)) {
    endGame("tie");
    return;
  }

  // Swap turns
  currentTurn = currentTurn === "X" ? "O" : "X";
  updateTurnIndicators();

  // If PvE AI turn is next
  if (gameMode === "pve" && currentTurn === "O" && isGameActive) {
    isAiThinking = true;
    setTimeout(makeAiMove, 600); // Small standard delay for natural "thinking" feel
  }
}

function updateTurnIndicators() {
  if (currentTurn === "X") {
    cardX.classList.add("active-turn");
    cardO.classList.remove("active-turn");
  } else {
    cardO.classList.add("active-turn");
    cardX.classList.remove("active-turn");
  }
  updateHoverPreviews();
}

function updateHoverPreviews() {
  cells.forEach((cell, idx) => {
    cell.classList.remove("preview-x", "preview-o");
    
    // Apply preview class only to empty cells if game is active
    if (boardState[idx] === "" && isGameActive && !isAiThinking) {
      if (currentTurn === "X") {
        cell.classList.add("preview-x");
      } else if (gameMode === "pvp") {
        // Only show O preview in PvP (against AI, CPU plays automatically)
        cell.classList.add("preview-o");
      }
    }
  });
}

function checkWin(board, player) {
  return WINNING_COMBOS.some(comboObj => {
    return comboObj.combo.every(idx => board[idx] === player);
  });
}

function checkDraw(board) {
  return board.every(cell => cell !== "");
}

function endGame(outcome) {
  isGameActive = false;
  
  // Visual indicators removal
  cells.forEach(cell => cell.classList.remove("preview-x", "preview-o"));
  cardX.classList.remove("active-turn");
  cardO.classList.remove("active-turn");

  if (outcome === "tie") {
    scores.ties++;
    saveScores();
    playSynthesizedSound("tie");
    showOutcomeModal("TIE GAME!", "Perfectly balanced strategies.", "tie");
  } else {
    // Determine winner coordinates
    const winningComboObj = WINNING_COMBOS.find(comboObj => {
      return comboObj.combo.every(idx => boardState[idx] === outcome);
    });

    if (winningComboObj) {
      drawWinningLine(winningComboObj);
    }

    if (outcome === "X") {
      scores.x++;
      saveScores();
      playSynthesizedSound("win");
      
      // Calculate modal spawn at board center
      const boardRect = gameBoard.getBoundingClientRect();
      startConfettiExplosion(boardRect.left + boardRect.width / 2, boardRect.top + boardRect.height / 2);
      
      showOutcomeModal("PLAYER X WINS!", "Absolute tactical victory.", "x");
    } else {
      scores.o++;
      saveScores();
      
      // If AI won, play tie/sad sound or win sound depending on context
      if (gameMode === "pve") {
        playSynthesizedSound("tie");
        showOutcomeModal("COMPUTER WINS!", "The machine calculated your defeat.", "o");
      } else {
        playSynthesizedSound("win");
        const boardRect = gameBoard.getBoundingClientRect();
        startConfettiExplosion(boardRect.left + boardRect.width / 2, boardRect.top + boardRect.height / 2);
        showOutcomeModal("PLAYER O WINS!", "Superb competitive maneuvers.", "o");
      }
    }
  }
}

function drawWinningLine(comboObj) {
  winningLine.setAttribute("x1", comboObj.x1);
  winningLine.setAttribute("y1", comboObj.y1);
  winningLine.setAttribute("x2", comboObj.x2);
  winningLine.setAttribute("y2", comboObj.y2);
  
  // Set class for theme-colored line glowing effects
  gameBoard.classList.remove("win-x", "win-o");
  gameBoard.classList.add(currentTurn === "X" ? "win-x" : "win-o");
  
  // Draw the SVG line
  winningLine.style.strokeDashoffset = 0;
}

function resetWinningLine() {
  winningLine.style.strokeDashoffset = 450;
  gameBoard.classList.remove("win-x", "win-o");
}

function showOutcomeModal(title, subtitle, type) {
  modalTitle.textContent = title;
  modalSubtitle.textContent = subtitle;
  
  // Setup the badge SVG inside modal
  if (type === "x") {
    modalBadge.className = "badge-icon badge-win-x";
    modalBadge.innerHTML = SVG_MARK_X;
    // Set stroke dash offset to draw immediately
    modalBadge.querySelector("path").classList.add("draw-active");
    modalBadge.querySelectorAll("path")[1].classList.add("draw-active");
  } else if (type === "o") {
    modalBadge.className = "badge-icon badge-win-o";
    modalBadge.innerHTML = SVG_MARK_O;
    modalBadge.querySelector("circle").classList.add("draw-active");
  } else {
    modalBadge.className = "badge-icon badge-tie";
    modalBadge.innerHTML = `
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
        <line x1="20" y1="50" x2="80" y2="50"></line>
        <line x1="20" y1="35" x2="80" y2="35"></line>
        <line x1="20" y1="65" x2="80" y2="65"></line>
      </svg>
    `;
  }

  // Delay modal appearance slightly for visual stroke drawing completion
  setTimeout(() => {
    outcomeModal.classList.remove("hidden");
  }, 700);
}

function restartRound() {
  // Clear boards
  boardState = Array(9).fill("");
  isGameActive = true;
  isAiThinking = false;
  currentTurn = "X";
  
  // Clear cells layout
  cells.forEach(cell => {
    cell.innerHTML = "";
    cell.className = "cell"; // remove previews
  });
  
  resetWinningLine();
  outcomeModal.classList.add("hidden");
  updateTurnIndicators();
}

// --- MINIMAX AI IMPLEMENTATION ---
function makeAiMove() {
  if (!isGameActive) return;
  
  let targetIndex;

  if (aiDifficulty === "easy") {
    // Play randomly on empty cells
    const emptyCells = boardState.reduce((acc, val, idx) => {
      if (val === "") acc.push(idx);
      return acc;
    }, []);
    targetIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  } else {
    // Play using unbeatable minimax search algorithm
    targetIndex = getBestMinimaxMove(boardState);
  }

  isAiThinking = false;
  if (targetIndex !== undefined) {
    makeMove(targetIndex, "O");
  }
}

function getBestMinimaxMove(board) {
  let bestScore = -Infinity;
  let bestMove;

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O"; // Simulate computer move
      let score = minimax(board, 0, false);
      board[i] = ""; // Undo simulator
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

// Evaluation values: O win = 10, X win = -10, Tie = 0
const scoresMap = {
  O: 10,
  X: -10,
  tie: 0
};

function minimax(board, depth, isMaximizing) {
  // Check terminal game status
  if (checkWin(board, "O")) return scoresMap.O - depth; // Prefer quicker wins
  if (checkWin(board, "X")) return scoresMap.X + depth; // Prefer slower losses
  if (checkDraw(board)) return scoresMap.tie;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// --- BUTTONS & TOGGLES SETUP ---

// Settings: Mode Toggles
modePvPBtn.addEventListener("click", () => {
  if (gameMode === "pvp") return;
  gameMode = "pvp";
  modePvPBtn.classList.add("active");
  modePvEBtn.classList.remove("active");
  
  // Disable AI selector
  aiDifficultyGroup.classList.add("disabled");
  diffEasyBtn.disabled = true;
  diffHardBtn.disabled = true;
  
  playerONameElement.textContent = "PLAYER O";
  restartRound();
});

modePvEBtn.addEventListener("click", () => {
  if (gameMode === "pve") return;
  gameMode = "pve";
  modePvEBtn.classList.add("active");
  modePvPBtn.classList.remove("active");
  
  // Enable AI selector
  aiDifficultyGroup.classList.remove("disabled");
  diffEasyBtn.disabled = false;
  diffHardBtn.disabled = false;
  
  playerONameElement.textContent = "COMPUTER AI";
  restartRound();
});

// Settings: Difficulty Toggles
diffEasyBtn.addEventListener("click", () => {
  if (aiDifficulty === "easy") return;
  aiDifficulty = "easy";
  diffEasyBtn.classList.add("active");
  diffHardBtn.classList.remove("active");
  restartRound();
});

diffHardBtn.addEventListener("click", () => {
  if (aiDifficulty === "hard") return;
  aiDifficulty = "hard";
  diffHardBtn.classList.add("active");
  diffEasyBtn.classList.remove("active");
  restartRound();
});

// Settings: Sound Control
soundToggleBtn.addEventListener("click", () => {
  isSoundEnabled = !isSoundEnabled;
  soundToggleBtn.classList.toggle("active", isSoundEnabled);
  
  const iconOn = soundToggleBtn.querySelector(".icon-sound-on");
  const iconOff = soundToggleBtn.querySelector(".icon-sound-off");
  
  if (isSoundEnabled) {
    iconOn.classList.remove("hidden");
    iconOff.classList.add("hidden");
    initAudio(); // Warm audio context
    playSynthesizedSound("click");
  } else {
    iconOn.classList.add("hidden");
    iconOff.classList.remove("hidden");
  }
});

// Settings: Light / Dark Theme Toggle
themeToggleBtn.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light-theme");
  
  const iconSun = themeToggleBtn.querySelector(".icon-sun");
  const iconMoon = themeToggleBtn.querySelector(".icon-moon");
  
  if (isLight) {
    iconSun.classList.add("hidden");
    iconMoon.classList.remove("hidden");
    themeToggleBtn.classList.add("active"); // glowing border in light theme
  } else {
    iconSun.classList.remove("hidden");
    iconMoon.classList.add("hidden");
    themeToggleBtn.classList.remove("active");
  }
  
  playSynthesizedSound("click");
});

// Restart & Reset Operations
restartBtn.addEventListener("click", () => {
  playSynthesizedSound("click");
  restartRound();
});

resetScoresBtn.addEventListener("click", () => {
  playSynthesizedSound("click");
  scores = { x: 0, o: 0, ties: 0 };
  saveScores();
});

modalActionBtn.addEventListener("click", () => {
  playSynthesizedSound("click");
  restartRound();
});

// Grid Event Handlers
cells.forEach(cell => {
  cell.addEventListener("click", handleCellClick);
});

// Initialize UI
loadScores();
updateTurnIndicators();
updateHoverPreviews();
