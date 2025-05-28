class SnakeGame{
    constructor() {
        this.gridWidth = 25;
        this.gridHeight = 20;
        this.initialSpeed = 200;
        
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.food = { x: 15, y: 10 };
        this.direction = 'RIGHT';
        this.gameState = 'idle'; // idle, playing, paused, gameOver, won
        this.score = 0;
        this.gameSpeed = this.initialSpeed;
        this.gameLoop = null;
        
        this.initializeBoard();
        this.bindEvents();
        this.updateDisplay();
    }
   
    initializeBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.style.gridTemplateColumns = `repeat(${this.gridWidth}, 1fr)`;
        gameBoard.innerHTML = '';
        
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${x}-${y}`;
                gameBoard.appendChild(cell);
            }
        }
    }

    
    bindEvents() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleKeyPress(e) {
        if (this.gameState !== 'playing') return;
        
        const keyDirections = {
            'ArrowUp': 'UP',
            'ArrowDown': 'DOWN',
            'ArrowLeft': 'LEFT',
            'ArrowRight': 'RIGHT'
        };
        
        const newDirection = keyDirections[e.key];
        if (newDirection) {
            e.preventDefault();
            this.changeDirection(newDirection);
        }
    }
    
    changeDirection(newDirection) {
        const oppositeDirections = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT'
        };
        
        if (oppositeDirections[this.direction] !== newDirection) {
            this.direction = newDirection;
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.updateDisplay();
        this.gameLoop = setInterval(() => this.moveSnake(), this.gameSpeed);
        
        document.getElementById('startBtn').classList.add('hidden');
        document.getElementById('pauseBtn').classList.remove('hidden');
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            clearInterval(this.gameLoop);
            document.getElementById('pauseBtn').textContent = 'Resume';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameLoop = setInterval(() => this.moveSnake(), this.gameSpeed);
            document.getElementById('pauseBtn').textContent = 'Pause';
        }
        this.updateDisplay();
    }
    
    resetGame() {
        clearInterval(this.gameLoop);
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.food = { x: 15, y: 10 };
        this.direction = 'RIGHT';
        this.gameState = 'idle';
        this.score = 0;
        this.gameSpeed = this.initialSpeed;
        
        document.getElementById('startBtn').classList.remove('hidden');
        document.getElementById('pauseBtn').classList.add('hidden');
        document.getElementById('pauseBtn').textContent = 'Pause';
        document.getElementById('gameOverModal').classList.add('hidden');
        
        this.updateDisplay();
        this.renderBoard();
    }
    
    moveSnake() {
        const head = { ...this.snake[0] };
        
        switch (this.direction) {
            case 'UP':
                head.y -= 1;
                break;
            case 'DOWN':
                head.y += 1;
                break;
            case 'LEFT':
                head.x -= 1;
                break;
            case 'RIGHT':
                head.x += 1;
                break;
        }
        
        // Check collisions
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.generateFood();
            
            // Increase speed
            this.gameSpeed = Math.max(this.gameSpeed - 5, 100);
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.moveSnake(), this.gameSpeed);
            
            // Check win condition
            if (this.snake.length === this.gridWidth * this.gridHeight) {
                this.gameWon();
                return;
            }
        } else {
            this.snake.pop();
        }
        
        this.updateDisplay();
        this.renderBoard();
    }
    
    checkCollision(head) {
        // Wall collision
        if (head.x < 0 || head.x >= this.gridWidth || head.y < 0 || head.y >= this.gridHeight) {
            return true;
        }
        
        // Self collision
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        clearInterval(this.gameLoop);
        
        document.getElementById('gameOverTitle').textContent = 'Game Over!';
        document.getElementById('gameOverMessage').textContent = `Your final score: ${this.score}`;
        document.getElementById('gameOverModal').classList.remove('hidden');
        
        this.updateDisplay();
    }
    
    gameWon() {
        this.gameState = 'won';
        clearInterval(this.gameLoop);
        
        document.getElementById('gameOverTitle').textContent = 'You Won! 🎉';
        document.getElementById('gameOverMessage').textContent = `Perfect score: ${this.score}! You filled the entire board!`;
        document.getElementById('gameOverModal').classList.remove('hidden');
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('speed').textContent = Math.floor((this.initialSpeed - this.gameSpeed) / 10) + 1;
        
        const statusMap = {
            'idle': 'Press Start to Play',
            'playing': 'Playing',
            'paused': 'Paused',
            'gameOver': 'Game Over',
            'won': 'You Won!'
        };
        
        document.getElementById('status').textContent = statusMap[this.gameState];
        this.renderBoard();
    }
    
    renderBoard() {
        // Clear all cells
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const cell = document.getElementById(`cell-${x}-${y}`);
                cell.className = 'cell';
            }
        }
        
        // Render snake
        this.snake.forEach((segment, index) => {
            const cell = document.getElementById(`cell-${segment.x}-${segment.y}`);
            if (cell) {
                cell.className = index === 0 ? 'cell snake-head' : 'cell snake-body';
            }
        });
        
        // Render food
        const foodCell = document.getElementById(`cell-${this.food.x}-${this.food.y}`);
        if (foodCell) {
            foodCell.className = 'cell food';
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});

function hump(){
    let count = 0
    let a = setInterval(() => {
        
    }, interval);
}
function js(as, pa){
    if(as == pa){
        console.log(`The values are equal: ${as}`);
    }
}