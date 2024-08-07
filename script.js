import { calculateSimilarity, FIOSolver } from "./figure-it-out.js";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from "ws";
import { SocketServer } from "./common/socketUtility.js";
import { CONFIG } from "./common/socketConfig.js";
import { GamePlayerManager } from "./game.js";

const app = express();
const apiRouter = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'frontend/build')));

app.use('/api', apiRouter); // App uses '/api' route

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

const server = http.createServer(app);
const port = process.env.PORT || 3000;

const wss = new WebSocketServer({ server, path: '/api/ws' });
const socketServer = new SocketServer(wss, CONFIG);

server.listen(port, () => {
  console.log(`Server (HTTP & WebSocket) running on port ${port}`);
});

const gamePlayerManager = new GamePlayerManager();
socketServer.on("connection", (socket) => {
  socket.on("join", (data) => {
    gamePlayerManager.handleJoin(socket, data);
  });
  socket.on("disconnect", () => {
    gamePlayerManager.handleDisconnect(socket);
  });
  socket.on("getGameList", () => {
    gamePlayerManager.handleGetGameList(socket);
  });
  socket.on("newGame", () => {
    gamePlayerManager.handleNewGame(socket);
  });
  socket.on("joinGame", (data) => {
    gamePlayerManager.handleJoinGame(socket, data);
  });
  socket.on("setGameProperties", (data) => {
    gamePlayerManager.handleSetGameProperties(socket, data);
  });
  socket.on("startRound", () => {
    gamePlayerManager.handleStartRound(socket);
  });
  socket.on("guess", (data) => {
    gamePlayerManager.handleGuess(socket, data);
  });
});