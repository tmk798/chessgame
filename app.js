const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
let currentPlayer = "w";
let gameActive = false;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { title: "Shatranj(Chess By TMK)" });
});

io.on("connection", function (socket) {
    console.log("New connection:", socket.id);

    // Send player count to all clients
    updatePlayerCount();

    socket.on("setUsername", (username) => {
        if (!players.white) {
            players.white = { id: socket.id, username: username || "Player 1" };
            socket.emit("playerRole", { role: "w", username: players.white.username });
            startGameIfReady();
        }
        else if (!players.black) {
            players.black = { id: socket.id, username: username || "Player 2" };
            socket.emit("playerRole", { role: "b", username: players.black.username });
            startGameIfReady();
        }
        else {
            socket.emit("spectatorRole");
        }

        updatePlayerInfo();
    });

    socket.on("disconnect", function () {
        if (socket.id === players.white?.id) {
            delete players.white;
            gameActive = false;
            io.emit("playerDisconnected", "white");
        }
        else if (socket.id === players.black?.id) {
            delete players.black;
            gameActive = false;
            io.emit("playerDisconnected", "black");
        }
        updatePlayerCount();
        updatePlayerInfo();
    });

    socket.on("move", (move) => {
        try {
            if (!gameActive) return;
            
            if (chess.turn() === 'w' && socket.id !== players.white?.id) return;
            if (chess.turn() === 'b' && socket.id !== players.black?.id) return;

            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen());
                
                // Check game over conditions
                if (chess.isGameOver()) {
                    let result = "Draw";
                    if (chess.isCheckmate()) {
                        result = chess.turn() === 'w' ? "Black wins by checkmate!" : "White wins by checkmate!";
                    }
                    io.emit("gameOver", result);
                    gameActive = false;
                }
            }
            else {
                socket.emit("invalidMove", "Invalid move");
            }
        }
        catch (err) {
            console.log(err);
            socket.emit("invalidMove", "Invalid move");
        }
    });

    function startGameIfReady() {
        if (players.white && players.black && !gameActive) {
            chess.reset();
            gameActive = true;
            currentPlayer = "w";
            io.emit("gameStarted", {
                white: players.white.username,
                black: players.black.username,
                fen: chess.fen()
            });
        }
    }

    function updatePlayerCount() {
        const count = (players.white ? 1 : 0) + (players.black ? 1 : 0);
        io.emit("playerCount", count);
    }

    function updatePlayerInfo() {
        io.emit("playerInfo", {
            white: players.white,
            black: players.black,
            gameActive
        });
    }
});

server.listen(3000, function () {
    console.log(`🚀 Server running at http://localhost:3000`);
});