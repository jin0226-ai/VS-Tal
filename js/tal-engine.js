/**
 * Tal Chess Engine
 * Hybrid approach: Tal's opening book + Stockfish-like evaluation with Tal-style heuristics
 */

class TalEngine {
    constructor() {
        this.difficulty = DIFFICULTY_LEVELS.intermediate;
        this.isThinking = false;
        this.game = null;
    }

    /**
     * Set the difficulty level
     */
    setDifficulty(level) {
        this.difficulty = getDifficulty(level);
        console.log(`Tal difficulty set to: ${this.difficulty.name} (${this.difficulty.rating} ELO)`);
    }

    /**
     * Set the game reference
     */
    setGame(game) {
        this.game = game;
    }

    /**
     * Get the best move for Tal
     * Uses hybrid approach: opening book first, then Tal-style evaluation
     */
    async getBestMove(game, playerColor) {
        this.game = game;
        this.isThinking = true;

        const talColor = playerColor === 'w' ? 'black' : 'white';
        const fen = game.fen();

        // First, check opening book
        const bookMove = this.getOpeningBookMove(fen, talColor);
        if (bookMove) {
            console.log(`Tal plays from opening book: ${bookMove}`);
            await this.simulateThinking();
            this.isThinking = false;
            return bookMove;
        }

        // Otherwise, use Tal-style evaluation
        const move = await this.calculateBestMove(game);
        this.isThinking = false;
        return move;
    }

    /**
     * Check if current position is in Tal's opening book
     */
    getOpeningBookMove(fen, color) {
        // Simplified FEN (without move counts)
        const simpleFen = fen.split(' ').slice(0, 4).join(' ');

        const book = color === 'white' ? TAL_OPENINGS.white : TAL_OPENINGS.black;

        // Find matching position
        for (const [position, moves] of Object.entries(book)) {
            if (simpleFen.startsWith(position.split(' ').slice(0, 4).join(' '))) {
                // Randomly select from book moves
                const selectedMove = moves[Math.floor(Math.random() * moves.length)];
                return this.convertToMoveObject(selectedMove);
            }
        }

        return null;
    }

    /**
     * Convert UCI move notation to move object
     */
    convertToMoveObject(uci) {
        if (!uci || uci.length < 4) return null;
        return {
            from: uci.substring(0, 2),
            to: uci.substring(2, 4),
            promotion: uci.length > 4 ? uci[4] : undefined
        };
    }

    /**
     * Calculate best move using Tal-style evaluation
     */
    async calculateBestMove(game) {
        const moves = game.moves({ verbose: true });
        if (moves.length === 0) return null;

        // Simulate thinking time
        await this.simulateThinking();

        // Should we make an intentional mistake?
        if (shouldMakeMistake(this.difficulty)) {
            console.log('Tal makes a small mistake (lower difficulty)');
            return this.getRandomMove(moves);
        }

        // Evaluate all moves with Tal-style scoring
        const scoredMoves = moves.map(move => {
            const score = this.evaluateMove(move, game);
            return { move, score };
        });

        // Sort by score (highest first)
        scoredMoves.sort((a, b) => b.score - a.score);

        // Add some randomness for lower difficulties
        const topMoves = scoredMoves.slice(0, Math.max(1, Math.ceil(3 * (1 - this.difficulty.talStyleIntensity * 0.5))));
        const selected = topMoves[Math.floor(Math.random() * topMoves.length)];

        console.log(`Tal plays: ${selected.move.san} (score: ${selected.score.toFixed(1)})`);

        return {
            from: selected.move.from,
            to: selected.move.to,
            promotion: selected.move.promotion
        };
    }

    /**
     * Evaluate a single move with Tal-style scoring
     */
    evaluateMove(move, game) {
        let score = 0;

        // Base score from material
        const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

        // Capture value
        if (move.captured) {
            score += pieceValues[move.captured] * 1.5; // Tal loves captures
        }

        // Tal-style bonuses
        score += calculateTalStyleBonus(move, game, this.difficulty);

        // Checkmate priority
        const tempGame = new Chess(game.fen());
        tempGame.move(move);

        if (tempGame.in_checkmate()) {
            score += 100000; // Always take checkmate!
        } else if (tempGame.in_check()) {
            score += TAL_STYLE_MODIFIERS.check;
        }

        // Sacrifice evaluation for Tal
        if (move.captured) {
            score += this.evaluateSacrifice(move, game);
        }

        // Position complexity bonus
        if (isComplexPosition(game)) {
            score += TAL_STYLE_MODIFIERS.complexPosition * this.difficulty.talStyleIntensity;
        }

        // King attack evaluation
        score += this.evaluateKingAttack(move, game);

        // Piece activity
        score += this.evaluatePieceActivity(move, game);

        return score;
    }

    /**
     * Evaluate potential sacrifices (Tal's specialty)
     */
    evaluateSacrifice(move, game) {
        let bonus = 0;
        const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };

        const movingPieceValue = pieceValues[move.piece] || 0;
        const capturedValue = pieceValues[move.captured] || 0;

        // If sacrificing material...
        if (movingPieceValue > capturedValue) {
            const materialLoss = movingPieceValue - capturedValue;

            // Tal would sacrifice if it leads to attack
            const tempGame = new Chess(game.fen());
            tempGame.move(move);

            // Check if sacrifice creates threats
            const attackMoves = tempGame.moves({ verbose: true }).filter(m =>
                m.san.includes('+') || m.captured
            );

            if (attackMoves.length > 2) {
                // Strong attack continues - worth it for Tal!
                bonus += (100 * materialLoss) * this.difficulty.talStyleIntensity;
            }

            // Check if sacrifice is within threshold
            if (materialLoss <= Math.abs(this.difficulty.sacrificeThreshold)) {
                bonus += 50 * this.difficulty.talStyleIntensity;
            }
        }

        return bonus;
    }

    /**
     * Evaluate attacking chances against enemy king
     */
    evaluateKingAttack(move, game) {
        let score = 0;
        const talColor = game.turn();
        const enemyColor = talColor === 'w' ? 'b' : 'w';

        const enemyKingSquare = findKingSquare(game, enemyColor);
        if (!enemyKingSquare) return 0;

        // Distance to enemy king
        const distBefore = squareDistance(move.from, enemyKingSquare);
        const distAfter = squareDistance(move.to, enemyKingSquare);

        // Bonus for approaching the king
        if (distAfter < distBefore) {
            score += (distBefore - distAfter) * 20 * this.difficulty.talStyleIntensity;
        }

        // Extra bonus for pieces near enemy king
        if (distAfter <= 3) {
            score += 30 * this.difficulty.talStyleIntensity;
        }

        return score;
    }

    /**
     * Evaluate piece activity
     */
    evaluatePieceActivity(move, game) {
        let score = 0;

        // Central squares bonus
        const centralSquares = ['d4', 'd5', 'e4', 'e5', 'c4', 'c5', 'f4', 'f5'];
        if (centralSquares.includes(move.to)) {
            score += 25;
        }

        // Development bonus (moving from back rank)
        const isWhite = move.color === 'w';
        const backRank = isWhite ? '1' : '8';
        if (move.from[1] === backRank && move.piece !== 'k') {
            score += 20;
        }

        // Penalty for moving same piece twice in opening
        if (game.history().length < 10) {
            const history = game.history({ verbose: true });
            const movedBefore = history.some(m => m.from === move.from || m.to === move.from);
            if (movedBefore) {
                score -= 15;
            }
        }

        return score;
    }

    /**
     * Get a random legal move (for mistakes)
     */
    getRandomMove(moves) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        return {
            from: randomMove.from,
            to: randomMove.to,
            promotion: randomMove.promotion
        };
    }

    /**
     * Simulate thinking time based on difficulty
     */
    async simulateThinking() {
        const baseTime = this.difficulty.thinkTime;
        const variance = baseTime * 0.3;
        const thinkTime = baseTime + (Math.random() * variance) - (variance / 2);

        return new Promise(resolve => setTimeout(resolve, thinkTime));
    }
}

// Global engine instance
const talEngine = new TalEngine();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TalEngine, talEngine };
}
