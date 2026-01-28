/**
 * Timer System for Tal Chess
 * Manages chess clock functionality with time controls
 */

// Time control presets (in seconds)
const TIME_CONTROLS = {
    bullet: {
        name: 'Bullet',
        time: 180,      // 3 minutes
        increment: 0,
        icon: '⚡',
        description: '3 min'
    },
    blitz: {
        name: 'Blitz',
        time: 300,      // 5 minutes
        increment: 0,
        icon: '🔥',
        description: '5 min'
    },
    rapid: {
        name: 'Rapid',
        time: 600,      // 10 minutes
        increment: 0,
        icon: '⏱️',
        description: '10 min'
    },
    classical: {
        name: 'Classical',
        time: 900,      // 15 minutes
        increment: 10,  // 10 second increment
        icon: '🏛️',
        description: '15+10'
    },
    unlimited: {
        name: 'Unlimited',
        time: Infinity,
        increment: 0,
        icon: '∞',
        description: 'No limit'
    }
};

class TimerManager {
    constructor() {
        this.playerTime = 0;
        this.opponentTime = 0;
        this.increment = 0;
        this.activeTimer = null; // 'player' or 'opponent'
        this.intervalId = null;
        this.isPaused = true;
        this.onTimeoutCallback = null;
        this.onTickCallback = null;
        this.currentTimeControl = 'rapid';
    }

    /**
     * Initialize timers with a time control
     */
    init(timeControlKey) {
        const control = TIME_CONTROLS[timeControlKey] || TIME_CONTROLS.rapid;
        this.currentTimeControl = timeControlKey;
        this.playerTime = control.time;
        this.opponentTime = control.time;
        this.increment = control.increment;
        this.activeTimer = null;
        this.isPaused = true;

        this.stopInterval();
        this.updateDisplay();

        console.log(`Timer initialized: ${control.name} (${control.description})`);
    }

    /**
     * Set callback for timeout
     */
    setTimeoutCallback(callback) {
        this.onTimeoutCallback = callback;
    }

    /**
     * Set callback for each tick
     */
    setTickCallback(callback) {
        this.onTickCallback = callback;
    }

    /**
     * Start the timer for a specific side
     */
    start(side) {
        if (this.currentTimeControl === 'unlimited') {
            return; // Don't start timer for unlimited games
        }

        this.activeTimer = side;
        this.isPaused = false;

        this.stopInterval();
        this.intervalId = setInterval(() => this.tick(), 100);
    }

    /**
     * Pause the timer
     */
    pause() {
        this.isPaused = true;
        this.stopInterval();
    }

    /**
     * Resume the timer
     */
    resume() {
        if (this.activeTimer && this.currentTimeControl !== 'unlimited') {
            this.isPaused = false;
            this.stopInterval();
            this.intervalId = setInterval(() => this.tick(), 100);
        }
    }

    /**
     * Switch timer to the other side (called after a move)
     */
    switchTimer() {
        if (this.currentTimeControl === 'unlimited') {
            return;
        }

        // Add increment to the player who just moved
        if (this.activeTimer === 'player') {
            this.playerTime += this.increment;
        } else if (this.activeTimer === 'opponent') {
            this.opponentTime += this.increment;
        }

        // Switch active timer
        this.activeTimer = this.activeTimer === 'player' ? 'opponent' : 'player';

        this.updateDisplay();
    }

    /**
     * Timer tick (runs every 100ms)
     */
    tick() {
        if (this.isPaused || !this.activeTimer) {
            return;
        }

        // Decrement active timer
        if (this.activeTimer === 'player') {
            this.playerTime -= 0.1;
            if (this.playerTime <= 0) {
                this.playerTime = 0;
                this.handleTimeout('player');
                return;
            }
        } else {
            this.opponentTime -= 0.1;
            if (this.opponentTime <= 0) {
                this.opponentTime = 0;
                this.handleTimeout('opponent');
                return;
            }
        }

        this.updateDisplay();

        // Call tick callback
        if (this.onTickCallback) {
            this.onTickCallback(this.playerTime, this.opponentTime, this.activeTimer);
        }
    }

    /**
     * Handle timeout
     */
    handleTimeout(loser) {
        this.stopInterval();
        this.isPaused = true;

        if (this.onTimeoutCallback) {
            this.onTimeoutCallback(loser);
        }
    }

    /**
     * Stop the interval
     */
    stopInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Update the timer display elements
     */
    updateDisplay() {
        const playerTimerEl = document.getElementById('player-timer');
        const opponentTimerEl = document.getElementById('opponent-timer');

        if (playerTimerEl) {
            playerTimerEl.textContent = this.formatTime(this.playerTime);
            this.updateTimerStyle(playerTimerEl, this.playerTime, this.activeTimer === 'player');
        }

        if (opponentTimerEl) {
            opponentTimerEl.textContent = this.formatTime(this.opponentTime);
            this.updateTimerStyle(opponentTimerEl, this.opponentTime, this.activeTimer === 'opponent');
        }
    }

    /**
     * Update timer element styling based on time and active state
     */
    updateTimerStyle(element, time, isActive) {
        element.classList.remove('timer-active', 'timer-low', 'timer-critical');

        if (this.currentTimeControl === 'unlimited') {
            return;
        }

        if (isActive) {
            element.classList.add('timer-active');
        }

        if (time <= 30 && time > 10) {
            element.classList.add('timer-low');
        } else if (time <= 10) {
            element.classList.add('timer-critical');
        }
    }

    /**
     * Format time as mm:ss or m:ss.s for low time
     */
    formatTime(seconds) {
        if (seconds === Infinity) {
            return '∞';
        }

        if (seconds <= 0) {
            return '0:00';
        }

        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        // Show tenths when under 20 seconds
        if (seconds < 20) {
            return `${mins}:${secs.toFixed(1).padStart(4, '0')}`;
        }

        return `${mins}:${Math.floor(secs).toString().padStart(2, '0')}`;
    }

    /**
     * Get current time control info
     */
    getTimeControl() {
        return TIME_CONTROLS[this.currentTimeControl];
    }

    /**
     * Reset timers
     */
    reset() {
        this.stopInterval();
        this.init(this.currentTimeControl);
    }

    /**
     * Get remaining time for a side
     */
    getTime(side) {
        return side === 'player' ? this.playerTime : this.opponentTime;
    }
}

// Global timer instance
const timerManager = new TimerManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TimerManager, timerManager, TIME_CONTROLS };
}
