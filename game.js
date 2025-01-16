const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreText = document.getElementById('scoreText');
const highScoreText = document.getElementById('highScoreText');
const startBtn = document.getElementById('startBtn');
const difficultySelect = document.getElementById('difficulty');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreText = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// 캔버스 크기 설정
canvas.width = 440;
canvas.height = 440;

// 게임 설정
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameSpeed = 100;
let gameInterval;
let isGameRunning = false;

// 뱀 초기 설정
let snake = [{ x: 10, y: 10 }];
let snakeSpeed = { x: 0, y: 0 };

// 먹이 초기 위치
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};

// 최고 점수 표시
highScoreText.textContent = highScore;

// 난이도 설정
difficultySelect.addEventListener('change', () => {
    switch(difficultySelect.value) {
        case 'easy':
            gameSpeed = 150;
            break;
        case 'medium':
            gameSpeed = 100;
            break;
        case 'hard':
            gameSpeed = 60;
            break;
    }
});

// 키보드 컨트롤
function handleDirection(direction) {
    switch(direction) {
        case 'up':
            if (snakeSpeed.y !== 1) {
                snakeSpeed.x = 0;
                snakeSpeed.y = -1;
            }
            break;
        case 'down':
            if (snakeSpeed.y !== -1) {
                snakeSpeed.x = 0;
                snakeSpeed.y = 1;
            }
            break;
        case 'left':
            if (snakeSpeed.x !== 1) {
                snakeSpeed.x = -1;
                snakeSpeed.y = 0;
            }
            break;
        case 'right':
            if (snakeSpeed.x !== -1) {
                snakeSpeed.x = 1;
                snakeSpeed.y = 0;
            }
            break;
    }
}

// 키보드 이벤트
document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp': handleDirection('up'); break;
        case 'ArrowDown': handleDirection('down'); break;
        case 'ArrowLeft': handleDirection('left'); break;
        case 'ArrowRight': handleDirection('right'); break;
    }
});

// 게임 루프
function gameLoop() {
    // 뱀이 움직이지 않고 있으면 리턴
    if (snakeSpeed.x === 0 && snakeSpeed.y === 0) {
        return;
    }

    const newHead = {
        x: snake[0].x + snakeSpeed.x,
        y: snake[0].y + snakeSpeed.y
    };

    // 벽 충돌 체크
    if (newHead.x < 0 || newHead.x >= tileCount || 
        newHead.y < 0 || newHead.y >= tileCount) {
        gameOver();
        return;
    }

    // 자기 몸과 충돌 체크
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === newHead.x && snake[i].y === newHead.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(newHead);

    // 먹이 먹었는지 체크
    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        scoreText.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreText.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        generateFood();
    } else {
        snake.pop();
    }

    draw();
}

// 게임 시작/일시정지
startBtn.addEventListener('click', () => {
    if (isGameRunning) {
        pauseGame();
        startBtn.textContent = '계속하기';
    } else {
        startGame();
        startBtn.textContent = '일시정지';
    }
});

function startGame() {
    if (!isGameRunning) {
        isGameRunning = true;
        // 게임 시작 시 게임 오버 화면 숨기기
        gameOverScreen.classList.add('hidden');
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

function pauseGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
}

function gameOver() {
    // 게임이 실행 중일 때만 게임 오버 처리
    if (isGameRunning) {
        isGameRunning = false;
        clearInterval(gameInterval);
        finalScoreText.textContent = score;
        gameOverScreen.classList.remove('hidden');
        startBtn.textContent = '시작';
    }
}

// 다시 시작
restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    resetGame();
    startGame();
    startBtn.textContent = '일시정지';
});

// 화면 그리기 함수
function draw() {
    // 배경
    ctx.fillStyle = '#f8fafc'; // slate-50
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 격자 그리기 (선택사항)
    ctx.strokeStyle = '#e2e8f0'; // slate-200
    for(let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // 뱀 그리기
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 머리는 더 진한 색상
            ctx.fillStyle = '#4f46e5'; // indigo-600
        } else {
            // 몸통은 좀 더 연한 색상
            ctx.fillStyle = '#6366f1'; // indigo-500
        }
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        
        // 각 세그먼트에 그라데이션 효과 추가
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(
            segment.x * gridSize + 2,
            segment.y * gridSize + 2,
            (gridSize - 2) / 2,
            (gridSize - 2) / 2
        );
    });

    // 먹이 그리기
    ctx.fillStyle = '#ef4444'; // red-500
    const foodX = food.x * gridSize;
    const foodY = food.y * gridSize;
    const foodSize = gridSize - 4;
    
    // 원형 먹이 그리기
    ctx.beginPath();
    ctx.arc(
        foodX + gridSize/2,
        foodY + gridSize/2,
        foodSize/2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 먹이에 하이라이트 효과 추가
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(
        foodX + gridSize/2 - 2,
        foodY + gridSize/2 - 2,
        foodSize/4,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 새로운 먹이 생성
function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
}

// 게임 리셋
function resetGame() {
    snake = [{ x: 10, y: 10 }];
    snakeSpeed = { x: 0, y: 0 }; // 초기에는 멈춘 상태로 시작
    score = 0;
    scoreText.textContent = score;
    generateFood();
}

// 초기 화면 그리기
draw(); 