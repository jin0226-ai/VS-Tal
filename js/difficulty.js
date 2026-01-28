/**
 * Difficulty System for Tal Chess
 * Adjusts AI strength and Tal-style intensity based on rating
 */

const DIFFICULTY_LEVELS = {
    beginner: {
        name: 'Beginner',
        rating: 800,
        stockfishDepth: 3,
        thinkTime: 500,
        talStyleIntensity: 0.2,  // 20% chance of Tal-style moves
        mistakeRate: 0.3,        // 30% chance of suboptimal move
        sacrificeThreshold: -5,  // Will sacrifice if eval drop < 5 pawns
        description: 'Learning the style',
        icon: '🌱'
    },
    intermediate: {
        name: 'Intermediate',
        rating: 1200,
        stockfishDepth: 7,
        thinkTime: 800,
        talStyleIntensity: 0.4,
        mistakeRate: 0.15,
        sacrificeThreshold: -3,
        description: 'Showing some tricks',
        icon: '🎯'
    },
    advanced: {
        name: 'Advanced',
        rating: 1600,
        stockfishDepth: 12,
        thinkTime: 1200,
        talStyleIntensity: 0.6,
        mistakeRate: 0.05,
        sacrificeThreshold: -2,
        description: 'Aggressive play',
        icon: '⚔️'
    },
    master: {
        name: 'Master',
        rating: 2000,
        stockfishDepth: 18,
        thinkTime: 2000,
        talStyleIntensity: 0.8,
        mistakeRate: 0.02,
        sacrificeThreshold: -1.5,
        description: 'Full tactical power',
        icon: '👑'
    },
    legend: {
        name: 'Legend',
        rating: 2700,
        stockfishDepth: 25,
        thinkTime: 3000,
        talStyleIntensity: 1.0,  // Maximum Tal style
        mistakeRate: 0,          // No mistakes
        sacrificeThreshold: -1,   // Will sacrifice for slight compensation
        description: 'Prime Tal unleashed',
        icon: '🔮'
    }
};

/**
 * Tal Style Modifiers
 * These weights adjust move evaluation to match Tal's aggressive style
 */
const TAL_STYLE_MODIFIERS = {
    // Bonus for aggressive moves (in centipawns)
    sacrifice: 150,        // Bonus for sacrificing material
    kingAttack: 100,       // Bonus for moves attacking enemy king
    check: 80,             // Bonus for giving check
    centerControl: 50,     // Bonus for central pawn advances
    pieceActivity: 40,     // Bonus for activating pieces
    complexPosition: 60,   // Bonus for creating complex positions

    // Penalties for passive moves
    defensiveMove: -30,    // Penalty for purely defensive moves
    simplification: -80,   // Penalty for piece trades (unless winning)
    passivePiece: -50,     // Penalty for retreating pieces

    // Position preference
    openFiles: 30,         // Preference for open files/diagonals
    kingUnsafe: 70,        // Bonus when enemy king is exposed
};

/**
 * Get difficulty settings by level name
 */
function getDifficulty(level) {
    return DIFFICULTY_LEVELS[level] || DIFFICULTY_LEVELS.intermediate;
}

/**
 * Calculate Tal-style score adjustment for a move
 * @param {Object} move - Chess.js move object
 * @param {Object} game - Chess.js game instance
 * @param {Object} difficulty - Current difficulty settings
 * @returns {number} - Score adjustment in centipawns
 */
function calculateTalStyleBonus(move, game, difficulty) {
    let bonus = 0;
    const intensity = difficulty.talStyleIntensity;

    // Check if move is a sacrifice (captures smaller piece with bigger piece)
    if (move.captured) {
        const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };
        const capturedValue = pieceValues[move.captured] || 0;
        const movingValue = pieceValues[move.piece] || 0;

        if (movingValue > capturedValue) {
            // This might be a sacrifice!
            bonus += TAL_STYLE_MODIFIERS.sacrifice * intensity;
        }
    }

    // Bonus for checks
    if (move.san && move.san.includes('+')) {
        bonus += TAL_STYLE_MODIFIERS.check * intensity;
    }

    // Bonus for central pawn moves
    if (move.piece === 'p') {
        const centralFiles = ['d', 'e'];
        if (centralFiles.includes(move.to[0])) {
            bonus += TAL_STYLE_MODIFIERS.centerControl * intensity;
        }
    }

    // Bonus for piece development in opening
    const moveCount = game.history().length;
    if (moveCount < 20) {
        if (['n', 'b'].includes(move.piece) && move.from[1] === '1' || move.from[1] === '8') {
            bonus += TAL_STYLE_MODIFIERS.pieceActivity * intensity;
        }
    }

    // Penalty for retreating pieces (moving back toward own side)
    const fromRank = parseInt(move.from[1]);
    const toRank = parseInt(move.to[1]);
    const isWhite = move.color === 'w';

    if ((isWhite && toRank < fromRank) || (!isWhite && toRank > fromRank)) {
        if (!move.captured) {
            bonus += TAL_STYLE_MODIFIERS.passivePiece * intensity;
        }
    }

    // Bonus for moves toward enemy king
    const enemyKingSquare = findKingSquare(game, move.color === 'w' ? 'b' : 'w');
    if (enemyKingSquare) {
        const distBefore = squareDistance(move.from, enemyKingSquare);
        const distAfter = squareDistance(move.to, enemyKingSquare);
        if (distAfter < distBefore) {
            bonus += TAL_STYLE_MODIFIERS.kingAttack * intensity * (distBefore - distAfter);
        }
    }

    return bonus;
}

/**
 * Find the king's square for a given color
 */
function findKingSquare(game, color) {
    const board = game.board();
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.type === 'k' && piece.color === color) {
                const files = 'abcdefgh';
                return files[col] + (8 - row);
            }
        }
    }
    return null;
}

/**
 * Calculate Manhattan distance between two squares
 */
function squareDistance(sq1, sq2) {
    const file1 = sq1.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank1 = parseInt(sq1[1]) - 1;
    const file2 = sq2.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank2 = parseInt(sq2[1]) - 1;

    return Math.abs(file1 - file2) + Math.abs(rank1 - rank2);
}

/**
 * Determine if position is complex (Tal's preference)
 */
function isComplexPosition(game) {
    const moves = game.moves();
    const history = game.history();

    // Complex if many legal moves and pieces are interacting
    const complexity = moves.length;
    const isMiddlegame = history.length >= 10 && history.length <= 40;

    return complexity > 30 && isMiddlegame;
}

/**
 * Should make intentional mistake based on difficulty
 */
function shouldMakeMistake(difficulty) {
    return Math.random() < difficulty.mistakeRate;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DIFFICULTY_LEVELS,
        TAL_STYLE_MODIFIERS,
        getDifficulty,
        calculateTalStyleBonus,
        shouldMakeMistake
    };
}
