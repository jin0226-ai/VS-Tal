/**
 * Tal Chess - Main Application
 * Interactive chess game against Mikhail Tal AI
 */

// Game state
let game = null;
let board = null;
let playerColor = 'white';
let currentDifficulty = 'intermediate';
let currentTimeControl = 'rapid';
let gameStarted = false;
let moveHistory = [];
let capturedByTal = [];
let capturedByPlayer = [];
let isGameOver = false;

// DOM Elements
const elements = {
    difficultySelection: null,
    gameContainer: null,
    boardElement: null,
    gameStatus: null,
    moveHistory: null,
    capturedByTal: null,
    capturedByPlayer: null,
    evalBar: null,
    evalWhite: null,
    evalText: null,
    loadingOverlay: null,
    gameOverModal: null,
    modalTitle: null,
    modalMessage: null,
    modalIcon: null,
    talRating: null
};

// Piece symbols for display
const PIECE_SYMBOLS = {
    'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
    'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
};

/**
 * Initialize the application
 */
function init() {
    // Cache DOM elements
    elements.difficultySelection = document.getElementById('difficulty-selection');
    elements.gameContainer = document.getElementById('game-container');
    elements.boardElement = document.getElementById('board');
    elements.gameStatus = document.getElementById('game-status');
    elements.moveHistory = document.getElementById('move-history');
    elements.capturedByTal = document.getElementById('captured-by-tal');
    elements.capturedByPlayer = document.getElementById('captured-by-player');
    elements.evalWhite = document.getElementById('eval-white');
    elements.evalText = document.getElementById('eval-text');
    elements.loadingOverlay = document.getElementById('loading-overlay');
    elements.gameOverModal = document.getElementById('game-over-modal');
    elements.modalTitle = document.getElementById('modal-title');
    elements.modalMessage = document.getElementById('modal-message');
    elements.modalIcon = document.getElementById('modal-icon');
    elements.talRating = document.getElementById('tal-rating');

    // Set up event listeners
    setupEventListeners();

    // Set up timer callbacks
    setupTimerCallbacks();

    console.log('Tal Chess initialized!');
}

/**
 * Set up timer callbacks
 */
function setupTimerCallbacks() {
    timerManager.setTimeoutCallback((loser) => {
        if (isGameOver) return;
        isGameOver = true;

        if (loser === 'player') {
            showModal('Time Out!', 'You ran out of time. Mikhail Tal wins by timeout! "Time is an illusion, but the clock is very real."', '⏰');
        } else {
            showModal('Time Out!', 'Mikhail Tal ran out of time. You win by timeout!', '🏆');
        }
    });
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.level;
        });
    });

    // Color selection
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            playerColor = btn.dataset.color;
        });
    });

    // Time control buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTimeControl = btn.dataset.time;
        });
    });

    // Start game button
    document.getElementById('start-game-btn').addEventListener('click', startGame);

    // Game control buttons
    document.getElementById('new-game-btn').addEventListener('click', () => {
        timerManager.pause();
        showDifficultySelection();
    });

    document.getElementById('undo-btn').addEventListener('click', undoMove);
    document.getElementById('flip-btn').addEventListener('click', flipBoard);

    // Modal buttons
    document.getElementById('play-again-btn').addEventListener('click', () => {
        hideModal();
        resetGame();
    });

    document.getElementById('change-difficulty-btn').addEventListener('click', () => {
        hideModal();
        timerManager.pause();
        showDifficultySelection();
    });

    // Set default difficulty button as active
    document.querySelector('.difficulty-btn[data-level="intermediate"]').classList.add('active');

    // Set default time control as active
    const defaultTimeBtn = document.querySelector('.time-btn[data-time="rapid"]');
    if (defaultTimeBtn) {
        defaultTimeBtn.classList.add('active');
    }
}

/**
 * Start a new game
 */
function startGame() {
    // Hide difficulty selection, show game
    elements.difficultySelection.classList.add('hidden');
    elements.gameContainer.classList.remove('hidden');

    // Set difficulty
    talEngine.setDifficulty(currentDifficulty);
    const diff = getDifficulty(currentDifficulty);
    elements.talRating.textContent = `(~${diff.rating} ELO)`;

    // Initialize chess.js
    game = new Chess();
    talEngine.setGame(game);

    // Reset game state
    moveHistory = [];
    capturedByTal = [];
    capturedByPlayer = [];
    isGameOver = false;
    updateCapturedPieces();

    // Initialize timer
    timerManager.init(currentTimeControl);

    // Initialize chessboard.js
    initBoard();

    gameStarted = true;
    updateStatus();

    // If player chose black, Tal (white) moves first
    if (playerColor === 'black') {
        timerManager.start('opponent');
        setTimeout(() => makeTalMove(), 500);
    } else {
        // Player is white, start player timer
        timerManager.start('player');
    }
}

/**
 * Initialize the chessboard
 */
function initBoard() {
    const config = {
        draggable: true,
        position: 'start',
        orientation: playerColor,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    };

    // Destroy existing board if any
    if (board) {
        board.destroy();
    }

    board = Chessboard('board', config);

    // Make board responsive
    $(window).resize(() => board.resize());
}

/**
 * Handle drag start - only allow dragging player's pieces
 */
function onDragStart(source, piece, position, orientation) {
    // Don't allow moves if game is over
    if (game.game_over() || isGameOver) return false;

    // Don't allow moves when it's Tal's turn
    const playerTurn = playerColor === 'white' ? 'w' : 'b';
    if (game.turn() !== playerTurn) return false;

    // Only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }

    return true;
}

/**
 * Handle piece drop
 */
function onDrop(source, target) {
    // See if the move is legal
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Always promote to queen for simplicity
    });

    // Illegal move
    if (move === null) return 'snapback';

    // Update captured pieces
    if (move.captured) {
        capturedByPlayer.push(move.captured);
        updateCapturedPieces();
    }

    // Switch timer after player move
    timerManager.switchTimer();

    // Update game state
    updateMoveHistory(move);
    updateStatus();
    updateEvaluation();

    // Check for game over
    if (game.game_over()) {
        isGameOver = true;
        timerManager.pause();
        handleGameOver();
        return;
    }

    // Tal's turn
    setTimeout(() => makeTalMove(), 300);
}

/**
 * Update board position after piece snap
 */
function onSnapEnd() {
    board.position(game.fen());
}

/**
 * Make Tal's move
 */
async function makeTalMove() {
    if (game.game_over() || isGameOver) return;

    showLoading();

    try {
        const talColorCode = playerColor === 'white' ? 'b' : 'w';

        // Make sure it's Tal's turn
        if (game.turn() !== talColorCode) {
            hideLoading();
            return;
        }

        // Get move from Tal engine
        const moveData = await talEngine.getBestMove(game, playerColor === 'white' ? 'w' : 'b');

        if (!moveData) {
            hideLoading();
            return;
        }

        // Make the move
        const move = game.move(moveData);

        if (move) {
            // Update captured pieces
            if (move.captured) {
                capturedByTal.push(move.captured);
                updateCapturedPieces();
            }

            // Update board
            board.position(game.fen());

            // Switch timer after Tal's move
            timerManager.switchTimer();

            // Update UI
            updateMoveHistory(move);
            updateStatus();
            updateEvaluation();

            // Check for game over
            if (game.game_over()) {
                isGameOver = true;
                timerManager.pause();
                handleGameOver();
            }
        }
    } catch (error) {
        console.error('Error in Tal move:', error);
    }

    hideLoading();
}

/**
 * Update game status display
 */
function updateStatus() {
    const status = elements.gameStatus;
    status.className = 'status-display';

    let text = '';
    const isPlayerTurn = game.turn() === (playerColor === 'white' ? 'w' : 'b');

    if (game.in_checkmate()) {
        text = isPlayerTurn ? 'Checkmate! Tal wins!' : 'Checkmate! You win!';
        status.classList.add('checkmate');
    } else if (game.in_draw()) {
        if (game.in_stalemate()) {
            text = 'Stalemate - Draw!';
        } else if (game.in_threefold_repetition()) {
            text = 'Draw by repetition';
        } else if (game.insufficient_material()) {
            text = 'Draw - Insufficient material';
        } else {
            text = 'Draw';
        }
    } else if (game.in_check()) {
        text = isPlayerTurn ? 'You are in check!' : 'Tal is in check!';
        status.classList.add('check');
    } else {
        text = isPlayerTurn ? 'Your turn' : 'Tal is thinking...';
    }

    status.innerHTML = `<span class="status-text">${text}</span>`;
}

/**
 * Update move history display
 */
function updateMoveHistory(move) {
    moveHistory.push(move);

    const historyEl = elements.moveHistory;
    historyEl.innerHTML = '';

    // Group moves in pairs (white, black)
    for (let i = 0; i < moveHistory.length; i += 2) {
        const moveNum = Math.floor(i / 2) + 1;
        const whiteMove = moveHistory[i];
        const blackMove = moveHistory[i + 1];

        const row = document.createElement('div');
        row.className = 'move-row';
        row.innerHTML = `
            <span class="move-number">${moveNum}.</span>
            <span class="move white-move">${whiteMove.san}</span>
            <span class="move black-move">${blackMove ? blackMove.san : ''}</span>
        `;
        historyEl.appendChild(row);
    }

    // Scroll to bottom
    historyEl.scrollTop = historyEl.scrollHeight;
}

/**
 * Update captured pieces display
 */
function updateCapturedPieces() {
    const talColor = playerColor === 'white' ? 'b' : 'w';

    // Tal's captures (player's pieces)
    elements.capturedByTal.textContent = capturedByTal
        .map(p => PIECE_SYMBOLS[playerColor === 'white' ? p.toUpperCase() : p])
        .join(' ');

    // Player's captures (Tal's pieces)
    elements.capturedByPlayer.textContent = capturedByPlayer
        .map(p => PIECE_SYMBOLS[playerColor === 'white' ? p : p.toUpperCase()])
        .join(' ');
}

/**
 * Update position evaluation display
 */
function updateEvaluation() {
    // Simple material count evaluation
    const boardState = game.board();
    const pieceValues = { p: 1, n: 3, b: 3.2, r: 5, q: 9 };

    let whiteScore = 0;
    let blackScore = 0;

    boardState.forEach(row => {
        row.forEach(piece => {
            if (piece) {
                const value = pieceValues[piece.type] || 0;
                if (piece.color === 'w') {
                    whiteScore += value;
                } else {
                    blackScore += value;
                }
            }
        });
    });

    const diff = whiteScore - blackScore;
    const evalPercent = 50 + (diff * 3); // Scale for visual
    const clampedPercent = Math.max(5, Math.min(95, evalPercent));

    elements.evalWhite.style.height = `${clampedPercent}%`;

    const sign = diff > 0 ? '+' : '';
    elements.evalText.textContent = `${sign}${diff.toFixed(1)}`;
}

/**
 * Handle game over
 */
function handleGameOver() {
    const isPlayerTurn = game.turn() === (playerColor === 'white' ? 'w' : 'b');

    if (game.in_checkmate()) {
        if (isPlayerTurn) {
            // Player lost
            showModal('Checkmate!', 'Mikhail Tal has won the game. "There are two types of sacrifices: correct ones, and mine."', '♚');
        } else {
            // Player won
            showModal('Victory!', 'Congratulations! You have defeated the Magician from Riga!', '🏆');
        }
    } else if (game.in_draw()) {
        let message = 'The game is drawn.';
        if (game.in_stalemate()) {
            message = 'The game ends in stalemate.';
        } else if (game.in_threefold_repetition()) {
            message = 'Draw by threefold repetition.';
        } else if (game.insufficient_material()) {
            message = 'Draw due to insufficient material.';
        }
        showModal('Draw!', message, '🤝');
    }
}

/**
 * Undo the last move (both player and Tal)
 */
function undoMove() {
    if (moveHistory.length < 2) return;

    // Undo Tal's move
    const talMove = game.undo();
    if (talMove && talMove.captured) {
        capturedByTal.pop();
    }
    moveHistory.pop();

    // Undo player's move
    const playerMove = game.undo();
    if (playerMove && playerMove.captured) {
        capturedByPlayer.pop();
    }
    moveHistory.pop();

    // Update board and UI
    board.position(game.fen());
    updateStatus();
    updateCapturedPieces();
    updateEvaluation();

    // Rebuild move history display
    const moves = [...moveHistory];
    moveHistory = [];
    elements.moveHistory.innerHTML = '<div class="no-moves">No moves yet</div>';
    moves.forEach(m => updateMoveHistory(m));

    if (moves.length === 0) {
        elements.moveHistory.innerHTML = '<div class="no-moves">No moves yet</div>';
    }
}

/**
 * Flip the board orientation
 */
function flipBoard() {
    board.flip();
}

/**
 * Reset the game with same settings
 */
function resetGame() {
    game = new Chess();
    talEngine.setGame(game);
    moveHistory = [];
    capturedByTal = [];
    capturedByPlayer = [];
    isGameOver = false;

    board.start();
    board.orientation(playerColor);

    // Reset timer
    timerManager.reset();

    updateStatus();
    updateCapturedPieces();
    updateEvaluation();
    elements.moveHistory.innerHTML = '<div class="no-moves">No moves yet</div>';

    if (playerColor === 'black') {
        timerManager.start('opponent');
        setTimeout(() => makeTalMove(), 500);
    } else {
        timerManager.start('player');
    }
}

/**
 * Show difficulty selection screen
 */
function showDifficultySelection() {
    elements.gameContainer.classList.add('hidden');
    elements.difficultySelection.classList.remove('hidden');
    gameStarted = false;
    isGameOver = false;
}

/**
 * Show loading overlay
 */
function showLoading() {
    elements.loadingOverlay.classList.remove('hidden');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
}

/**
 * Show game over modal
 */
function showModal(title, message, icon) {
    elements.modalTitle.textContent = title;
    elements.modalMessage.textContent = message;
    elements.modalIcon.textContent = icon;
    elements.gameOverModal.classList.remove('hidden');
}

/**
 * Hide modal
 */
function hideModal() {
    elements.gameOverModal.classList.add('hidden');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
