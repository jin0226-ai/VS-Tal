/**
 * Mikhail Tal's Opening Book
 * Based on his actual games and preferred openings
 * Expanded with data from famous Tal games
 */

const TAL_OPENINGS = {
    // Tal's responses as White
    white: {
        // Starting position - e4 (Tal's signature)
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': ['e2e4'],

        // ============================================
        // SICILIAN DEFENSE RESPONSES (Tal's favorite to face)
        // ============================================

        // 1.e4 c5 - Open Sicilian
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['g1f3'],

        // 1.e4 c5 2.Nf3 d6 - Najdorf/Dragon setup
        'rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -': ['d2d4'],

        // 1.e4 c5 2.Nf3 Nc6
        'r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -': ['d2d4'],

        // 1.e4 c5 2.Nf3 e6 - Scheveningen/Kan
        'rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -': ['d2d4'],

        // Open Sicilian main line: 3.d4 cxd4 4.Nxd4
        'rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq -': ['f3d4'],

        // Sicilian Najdorf: 4...Nf6 5.Nc3
        'rnbqkb1r/pp2pppp/3p1n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -': ['b1c3'],

        // Sicilian Najdorf: 5...a6 - Main line, Tal plays 6.Bg5 or 6.Be3 (English Attack)
        'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -': ['c1g5', 'c1e3', 'f2f3'],

        // Sicilian Dragon: 5...g6
        'rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -': ['c1e3', 'f2f3'],

        // Sicilian Scheveningen: 5...e6
        'rnbqkb1r/pp3ppp/3ppn2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -': ['g2g4', 'c1e3'], // Keres Attack!

        // ============================================
        // AGAINST 1.e4 e5
        // ============================================

        // 1.e4 e5 - King's Gambit or Italian
        'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['g1f3', 'f2f4'],

        // King's Gambit: 2.f4
        'rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq -': ['e5f4'], // Accept it!

        // King's Gambit Accepted: 3.Nf3
        'rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP2PP/RNBQKBNR w KQkq -': ['g1f3'],

        // Italian Game: 2.Nf3 Nc6 3.Bc4
        'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -': ['f1c4', 'd2d4'],

        // Italian/Scotch continuation
        'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq -': ['f1c5', 'g8f6'],

        // Scotch Game: 3.d4
        'r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -': ['e5d4'],

        // ============================================
        // FRENCH DEFENSE
        // ============================================

        // 1.e4 e6 - French
        'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['d2d4'],

        // French: 2.d4 d5
        'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -': ['b1c3', 'e4e5'],

        // French Advance: 3.e5
        'rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq -': ['c7c5'],

        // French Classical/Steinitz: 3.Nc3
        'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq -': ['g8f6', 'd5e4'],

        // ============================================
        // CARO-KANN DEFENSE
        // ============================================

        // 1.e4 c6
        'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['d2d4'],

        // Caro-Kann: 2.d4 d5
        'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -': ['b1c3', 'e4e5'],

        // Caro-Kann Advance
        'rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq -': ['c8f5'],

        // ============================================
        // PIRC/MODERN DEFENSE
        // ============================================

        // 1.e4 d6
        'rnbqkbnr/ppp1pppp/3p4/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['d2d4'],

        // Pirc: 2.d4 Nf6 3.Nc3
        'rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -': ['b1c3'],

        // Austrian Attack setup
        'rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq -': ['g7g6'],
        'rnbqkb1r/ppp1pp1p/3p1np1/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq -': ['f2f4'], // Austrian Attack!

        // ============================================
        // ALEKHINE DEFENSE
        // ============================================

        // 1.e4 Nf6
        'rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': ['e4e5'],

        // 2.e5 Nd5 3.d4
        'rnbqkb1r/pppppppp/8/3nP3/8/8/PPPP1PPP/RNBQKBNR w KQkq -': ['d2d4'],
    },

    // Tal's responses as Black
    black: {
        // ============================================
        // AGAINST 1.e4 - SICILIAN NAJDORF (Tal's favorite!)
        // ============================================

        // 1.e4 - Play Sicilian!
        'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -': ['c7c5'],

        // 1.e4 c5 2.Nf3 - Najdorf setup with d6
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -': ['d7d6'],

        // Open Sicilian: 2...d6 3.d4 - Take!
        'rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -': ['c5d4'],

        // 3...cxd4 4.Nxd4 - Play Nf6
        'rnbqkbnr/pp2pppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq -': ['g8f6'],

        // 4...Nf6 5.Nc3 - The Najdorf move: a6!
        'rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq -': ['a7a6'],

        // Najdorf main line after 6.Bg5
        'rnbqkb1r/1p2pppp/p2p1n2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R b KQkq -': ['e7e6'],

        // Najdorf after 6.Be3 (English Attack)
        'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq -': ['e7e5', 'e7e6', 'b8d7'],

        // Najdorf after 6.Be2
        'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP1BPPP/R1BQK2R b KQkq -': ['e7e5'],

        // Najdorf after 6.f3 (English Attack)
        'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N2P2/PPP3PP/R1BQKB1R b KQkq -': ['e7e5', 'e7e6'],

        // Poisoned Pawn Variation: 6.Bg5 e6 7.f4 Qb6!?
        'rnbqkb1r/1p3ppp/p2ppn2/6B1/3NPP2/2N5/PPP3PP/R2QKB1R b KQkq -': ['d8b6'],

        // ============================================
        // AGAINST 1.d4 - KING'S INDIAN DEFENSE (Tal's trusted weapon)
        // Based on Botvinnik vs Tal 1960 World Championship
        // ============================================

        // 1.d4 - Play Nf6 for KID
        'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq -': ['g8f6'],

        // 1.d4 Nf6 2.c4 - Fianchetto!
        'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -': ['g7g6'],

        // 2...g6 3.Nc3 - Complete fianchetto
        'rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -': ['f8g7'],

        // 3...Bg7 4.e4 - Play d6 (Classical KID)
        'rnbqkb1r/pppppp1p/5np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq -': ['d7d6'],

        // Classical KID: 4...d6 5.Nf3 - Castle
        'rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R b KQkq -': ['e8g8'],

        // KID: 5...0-0 6.Be2 - The classical e5 break!
        'rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQkq -': ['e7e5'],

        // KID Sämisch: 4...d6 5.f3
        'rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N2P2/PP4PP/R1BQKBNR b KQkq -': ['e8g8'],

        // After castling in Sämisch: ...e5 or ...c5
        'rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2P2/PP4PP/R1BQKBNR b KQkq -': ['e7e5', 'c7c5'],

        // KID Four Pawns Attack: 5.f4
        'rnbqk2r/ppp1ppbp/3p1np1/8/2PPPP2/2N5/PP4PP/R1BQKBNR b KQkq -': ['e8g8', 'c7c5'],

        // Botvinnik vs Tal WC 1960 Game 6: 5.f3 0-0 6.Nge2
        'rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2P2/PP2N1PP/R1BQKB1R b KQkq -': ['e7e5'],

        // After ...e5: The Mar del Plata Attack begins
        'rnbq1rk1/ppp2pbp/3p1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQkq -': ['b8c6', 'b8d7'],

        // ============================================
        // AGAINST 1.c4 - ENGLISH OPENING
        // ============================================

        // 1.c4 - Symmetrical or e5
        'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq -': ['e7e5', 'g8f6', 'c7c5'],

        // English with e5: 2.Nc3
        'rnbqkbnr/pppp1ppp/8/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR b KQkq -': ['g8f6', 'b8c6'],

        // ============================================
        // AGAINST 1.Nf3 - RETI/INDIAN SYSTEMS
        // ============================================

        // 1.Nf3 - Flexible setup
        'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq -': ['d7d5', 'g8f6'],

        // ============================================
        // BENONI DEFENSE (Very aggressive, Tal-like)
        // ============================================

        // Against 1.d4 - Alternative Benoni setup
        'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -': ['c7c5', 'g7g6'],

        // Modern Benoni: 2.d5
        'rnbqkb1r/pp1ppppp/5n2/2pP4/2P5/8/PP2PPPP/RNBQKBNR b KQkq -': ['e7e6'],

        // Benoni after 3.cxd5
        'rnbqkb1r/pp1p1ppp/4pn2/2pP4/8/2N5/PP2PPPP/R1BQKBNR b KQkq -': ['d7d6'],

        // Benoni main line: fianchetto
        'rnbqkb1r/pp3ppp/3ppn2/2pP4/4P3/2N5/PP3PPP/R1BQKBNR b KQkq -': ['g7g6'],
    },

    // Famous Tal sacrifices and tactical patterns
    tacticalPatterns: {
        // These are move patterns Tal would consider in similar positions
        kingsideAttack: ['h2h4', 'g4g5', 'h4h5', 'g5g6', 'f3g5', 'h5h6'],
        queensidePawnStorm: ['a2a4', 'b2b4', 'a4a5', 'b4b5'],
        centralBreakthrough: ['d4d5', 'e4e5', 'f2f4', 'e5e6'],
        piecesSacrifice: ['f6g4', 'b5c6', 'f3g5', 'c4f7', 'd5e6', 'b5d7'],
        knightOutposts: ['c5', 'd5', 'e5', 'f5'],
    },

    // Tal's famous game snippets
    famousGames: {
        // Tal vs Larsen, Candidates 1965 - Sicilian Najdorf
        'talVsLarsen1965': '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6',
        // Fischer vs Tal, Bled 1959 - Sicilian Najdorf
        'fischerVsTal1959': '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Bc4',
        // Botvinnik vs Tal, WC 1960 Game 6 - King's Indian
        'botvinnikVsTal1960': '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Nge2 e5',
    }
};

// Tal's favorite opening names for display
const TAL_OPENING_NAMES = {
    'sicilian_najdorf': 'Sicilian Najdorf - "The Rolls Royce of openings"',
    'sicilian_dragon': 'Sicilian Dragon - Fire-breathing chess',
    'sicilian_scheveningen': 'Sicilian Scheveningen - Flexibility and counterplay',
    'kings_indian': "King's Indian Defense - Tal's trusted weapon",
    'french_advance': 'French Defense - Breaking through',
    'kings_gambit': "King's Gambit - Romantic chess at its finest",
    'benoni': 'Benoni Defense - Dynamic counterplay',
    'english_attack': 'Sicilian English Attack - Modern aggression',
    'austrian_attack': 'Pirc Austrian Attack - Full throttle',
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TAL_OPENINGS, TAL_OPENING_NAMES };
}
