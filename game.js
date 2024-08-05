import { FIOGame, FIOSolver } from "./figure-it-out.js";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from "ws";
import { SocketServer } from "./common/socketUtility.js";
import { CONFIG } from "./common/socketConfig.js";

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
const front_port = 3000;

const wss = new WebSocketServer({ server, path: '/api/ws' });
const socketServer = new SocketServer(wss, CONFIG);

server.listen(front_port, () => {
  console.log(`Server (HTTP & WebSocket) running on port ${front_port}`);
});

const properties = [
  {
    property: 'color',
    values: ['red', 'green', 'blue', 'orange']
  },
  {
    property: 'shape',
    values: ['circle', 'square', 'triangle', 'star']
  },
  {
    property: 'size',
    values: ['small', 'medium', 'large']
  },
  {
    property: 'fill',
    values: ['solid', 'horizontal-striped', 'vertical-striped', 'cross-hatch', 'dotted']
  }
];

socketServer.on("connection", (socket) => {
  const answerString = properties.map((p) => p.values[Math.floor(Math.random() * p.values.length)]);
  const game = new FIOGame(properties, answerString);
  const solver = new FIOSolver(properties);
  socket.emit("properties", { properties });
  socket.on("guess", (data) => {
    const guess = data.guess;
    const similarity = game.calculateSimilarity(guess);
    socket.emit("guessResult", { guess, similarity });
    solver.updateViableCards(guess, similarity);
    const nextGuess = solver.getGuess();
    console.log("next guess", nextGuess.map((v, i) => properties[i].values[v]));

  });
});