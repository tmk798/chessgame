const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
const playerInfoElement = document.createElement("div");
const waitingLobby = document.createElement("div");
const promotionDialog = document.createElement("div");
const timerElement = document.createElement("div");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;
let username = null;
let gameActive = false;

// Setup UI
function setupUI() {
    document.body.innerHTML = '';
    document.body.appendChild(createHeader());
    document.body.appendChild(waitingLobby);
    document.body.appendChild(createGameContainer());
    document.body.appendChild(createLoginForm());
    
    waitingLobby.className = "hidden";
    waitingLobby.innerHTML = "<h2>Waiting for opponent...</h2>";
    
    promotionDialog.className = "promotion-dialog hidden";
    promotionDialog.innerHTML = `
        <h3>Promote to:</h3>
        <div class="promotion-options">
            <button data-piece="q">♕ Queen</button>
            <button data-piece="r">♖ Rook</button>
            <button data-piece="b">♗ Bishop</button>
            <button data-piece="n">♘ Knight</button>
        </div>
    `;
    document.body.appendChild(promotionDialog);
}

function createHeader() {
    const header = document.createElement("header");
    header.className = "game-header";
    
    timerElement.className = "timer";
    timerElement.textContent = "Time: 00:00";
    
    playerInfoElement.className = "player-info";
    playerInfoElement.innerHTML = `
        <div class="player white"></div>
        <div class="player black"></div>
    `;
    
    header.appendChild(timerElement);
    header.appendChild(playerInfoElement);
    return header;
}

function createGameContainer() {
    const container = document.createElement("div");
    container.className = "game-container";
    container.appendChild(boardElement);
    return container;
}

function createLoginForm() {
    const form = document.createElement("div");
    form.className = "login-form";
    form.innerHTML = `
        <h2>Join Chess Game</h2>
        <input type="text" id="username" placeholder="Enter your name" />
        <button id="join-btn">Join Game</button>
    `;
    
    form.querySelector("#join-btn").addEventListener("click", () => {
        username = document.getElementById("username").value.trim() || `Player_${Math.floor(Math.random() * 1000)}`;
        socket.emit("setUsername", username);
        form.classList.add("hidden");
    });
    
    return form;
}

// Initialize
setupUI();

// Board rendering and game logic
const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";

    board.forEach((row, rowindex) => {
        row.forEach((square, squareindex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", (rowindex + squareindex) % 2 === 0 ? "light" : "dark");
            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
                pieceElement.innerHTML = `<span>${getPieceUnicode(square)}</span>`;
                pieceElement.draggable = playerRole === square.color && gameActive;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowindex, col: squareindex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => e.preventDefault());
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };
                    handleMove(sourceSquare, targetSquare);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });

    boardElement.classList.toggle("flipped", playerRole === 'b');
};

const handleMove = (source, target) => {
    // Check if promotion is needed
    const piece = chess.get(`${String.fromCharCode(97 + source.col)}${8 - source.row}`);
    const isPromotion = piece?.type === 'p' && (target.row === 0 || target.row === 7);
    
    if (isPromotion) {
        showPromotionDialog(source, target);
    } else {
        makeMove(source, target);
    }
};

const makeMove = (source, target, promotion = 'q') => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion
    };
    socket.emit("move", move);
};

const showPromotionDialog = (source, target) => {
    promotionDialog.classList.remove("hidden");
    
    promotionDialog.querySelectorAll("button").forEach(btn => {
        btn.onclick = () => {
            makeMove(source, target, btn.dataset.piece);
            promotionDialog.classList.add("hidden");
        };
    });
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
        P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔"
    };
    return unicodePieces[piece.type] || "";
};

// Socket events
socket.on("playerRole", (data) => {
    playerRole = data.role;
    waitingLobby.innerHTML = `<p>You are playing as ${data.role === 'w' ? 'White' : 'Black'}</p>`;
    renderBoard();
});

socket.on("spectatorRole", () => {
    playerRole = null;
    waitingLobby.innerHTML = "<p>You are spectating</p>";
    renderBoard();
});

socket.on("playerCount", (count) => {
    waitingLobby.innerHTML = `<p>Players connected: ${count}/2</p>`;
});

socket.on("playerInfo", (data) => {
    const whitePlayer = data.white ? `${data.white.username} (White)` : "Waiting...";
    const blackPlayer = data.black ? `${data.black.username} (Black)` : "Waiting...";
    
    playerInfoElement.querySelector(".white").textContent = whitePlayer;
    playerInfoElement.querySelector(".black").textContent = blackPlayer;
    
    gameActive = data.gameActive;
    if (gameActive) {
        waitingLobby.classList.add("hidden");
    } else {
        waitingLobby.classList.remove("hidden");
    }
});

socket.on("gameStarted", (data) => {
    gameActive = true;
    waitingLobby.classList.add("hidden");
    playerInfoElement.querySelector(".white").textContent = `${data.white} (White)`;
    playerInfoElement.querySelector(".black").textContent = `${data.black} (Black)`;
    chess.load(data.fen);
    renderBoard();
    
    // Start timer
    startTimer();
});

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});

socket.on("playerDisconnected", (color) => {
    gameActive = false;
    alert(`${color} player disconnected! Game paused.`);
});

socket.on("gameOver", (result) => {
    gameActive = false;
    alert(result);
});

socket.on("invalidMove", (message) => {
    alert(message);
});

// Timer functionality
let timerInterval;
function startTimer() {
    let seconds = 0;
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerElement.textContent = `Time: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        if (!gameActive) {
            clearInterval(timerInterval);
        }
    }, 1000);
}

// Initial render
renderBoard();