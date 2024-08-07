import { calculateSimilarity } from "./figure-it-out.js";

const DEFAULT_GAME_PROPERTIES = {
    figureParams : [],
    rounds : 0,
    roundTime : 0,
    scoreParams : {
        guessMax : 0,
        timeScore : 0
    }
};
const DEFAULT_GAME_INFO = {
    "code" : "",
    "players" : [],
    "roundInfo" : {
        "currRound" : 0,
        "timeEnd" : 0,
        "finished" : false
    },
    "gameProperties" : DEFAULT_GAME_PROPERTIES,
    "host_id" : 0
};
export class GamePlayerManager{
    constructor(){
        this.games = new Map();
        this.players = new Map();
    }
    handleJoin(socket, data){
        let { id, name } = data;
        let player = this.players.get(id);
        if (!player){
            id = Math.floor(Math.random() * 65536);
            player = new Player(id, name);
            this.players.set(id, player);
        }
        socket.id = id;
        player.addSocket(socket);
        player.clearDeleteTimeout();
        const game = this.games.get(player.gameCode);
        let gameInfo = DEFAULT_GAME_INFO;
        if (player.gameCode && game){
            gameInfo = game.info;
        }
        socket.emit("joinResponse", {
            id: player.id,
            name: player.name,
            game: gameInfo
        });
    }
    handleDisconnect(socket){
        const player = this.players.get(socket.id);
        if (!player){
            return;
        }
        player.removeSocket(socket);
        if (player.sockets.size === 0) {
            player.setDeleteTimeout(() => {
                if (player.gameCode){
                    const game = this.games.get(player.gameCode);
                    game.removePlayer(player);
                    game.emit("playerJoinLeave", {
                        id: player.id,
                        name: player.name,
                        join: false
                    });
                    if (game.players.size === 0){
                        this.games.delete(player.gameCode);
                    }
                }
                this.players.delete(socket.id);
            });
        }
    }
    handleGetGameList(socket){
        const games = Array.from(this.games.values()).map(game => game.info);
        socket.emit("gameList", { games });
    }
    handleNewGame(socket){
        const code = Math.random().toString(36).substring(2, 8);
        const player = this.players.get(socket.id);
        const game = new Game(code, player.id);
        game.addPlayer(player);
        this.games.set(code, game);
        socket.emit("joinGameResponse", {
            success: true,
            game: game.info
        });
    }
    handleJoinGame(socket, data){
        const player = this.players.get(socket.id);
        const game = this.games.get(data.code);
        
        if (game){
            game.emit("playerJoinLeave", {
                id: player.id,
                name: player.name,
                join: true
            });
            game.addPlayer(player);
            socket.emit("joinGameResponse", {
                success: true,
                game: game.info
            });
        } else {
            socket.emit("joinGameResponse", {
                success: false,
                game: DEFAULT_GAME_INFO
            });
        }
    }
    handleSetGameProperties(socket, data){
        const player = this.players.get(socket.id);
        const game = this.games.get(player.gameCode);
        if (game && player.id === game.host_id){
            game.gameProperties = data;
            game.emit("gamePropertiesUpdate", game.gameProperties);
        }
    }
    handleStartRound(socket){
        const player = this.players.get(socket.id);
        const game = this.games.get(player.gameCode);
        if (game && player.id === game.host_id){
            game.doRound();
        }
    }
    handleGuess(socket, data){
        const player = this.players.get(socket.id);
        const game = this.games.get(player.gameCode);
        if (game && !game.roundInfo.finished){
            const guess = data.guess;
            const similarity = calculateSimilarity(guess, game.roundInfo.answer);
            const N = game.gameProperties.figureParams.length;
            const solved = similarity === N;
            player.addGuess(guess, similarity, solved);
            player.emit("guessResult", {
                guess,
                similarity
            });
        }
    }
}
class Game {
    constructor(code, host_id) {
        this.code = code;
        this.host_id = host_id;
        this.players = new Map();
        this.gameProperties = {
            "figureParams" : [
                {
                  property: 'color',
                  values: ['red', 'green', 'blue', 'orange', 'purple', 'black', 'grey']
                },
                {
                  property: 'shape',
                  values: ['circle', 'square', 'triangle', 'star']
                },
                {
                  property: 'fill',
                  values: ['solid', 'horizontal-striped', 'vertical-striped', 'cross-hatch', 'dotted']
                },
                {
                  property: 'dot',
                  values: ['left', 'up', 'right', 'down']
                },
                {
                  property: 'dotColor',
                  values: ['red', 'green', 'blue', 'orange', 'purple', 'black', 'grey']
                }
            ],
            "rounds" : 3,
            "roundTime" : 60,
            "scoreParams" : {
                /*
                if g is the number of guesses taken until the correct solution is found,
                and t is the number of seconds remaining when the correct solution is found,
                the score is calculated as follows:
                score = 1000 * (1 - (min(g, guessMax) - 1)/ (guessMax)) + timeScore * t/roundTime
                otherwise, if the correct solution is not found, the score is 0
                */
                "guessMax" : 12,
                "timeScore" : 150
            }
        };
        this.roundInfo = new RoundInfo(this);
    }
    get info(){
        return {
            code: this.code,
            players: Array.from(this.players.values()).map(player => {
                return {
                    id: player.id,
                    name: player.name,
                    score: player.score,
                    totalScore: player.totalScore
                };
            }),
            roundInfo : {
                currRound : this.roundInfo.currRound,
                timeEnd : this.roundInfo.timeEnd,
                finished : this.roundInfo.finished
            },
            gameProperties: this.gameProperties,
            host_id: this.host_id
        };
    }
    get playersSolved(){
        return Array.from(this.players.values()).filter(player => player.solveTime).length;
    }
    generateRandomAnswer(){
        return this.gameProperties.figureParams.map(p => Math.floor(Math.random() * p.values.length));
    }
    addPlayer(player) {
        this.players.set(player.id, player);
        player.setGameCode(this.code);
    }
    removePlayer(player) {
        this.players.delete(player.id);
        player.setGameCode(null);
    }
    emit(event, data) {
        for (const player of this.players.values()) {
            player.emit(event, data);
        }
    }
    async doRound() {
        const roundInfo = this.roundInfo;
        if (!roundInfo.finished){
            return;
        }
        if (roundInfo.currRound === this.gameProperties.rounds){
            const players = Array.from(this.players.values()).map(player => {
                return {
                    id: player.id,
                    name: player.name,
                    totalScore: player.totalScore
                };
            });
            this.emit("gameOver", {
                "players" : players
            });
            this.roundInfo = new RoundInfo(this);
            this.resetPlayerGame();
            return;
        }
        roundInfo.newRound();
        this.resetPlayerRound();
        this.emit("roundStart", {
            "round" : roundInfo.currRound,
            "timeEnd" : roundInfo.timeEnd,
        });
        for (let time = roundInfo.timeStart; time <= roundInfo.timeEnd; time += 1000){
            await new Promise(resolve => setTimeout(resolve, time - Date.now()));
            if (this.playersSolved === this.players.size){
                break;
            }
        }
        roundInfo.endRound();
        this.calculatePlayerScores();
        const players = Array.from(this.players.values()).map(player => {
            return {
                id: player.id,
                name: player.name,
                score: player.score,
                totalScore: player.totalScore
            };
        });
        this.emit("roundEnd", {
            "round" : this.roundInfo.currRound,
            "solution" : this.roundInfo.answer,
            "players" : players
        });
    }
    resetPlayerGame(){
        for (const player of this.players.values()){
            player.resetGame();
        }
    }
    resetPlayerRound(){
        for (const player of this.players.values()){
            player.resetRound();
        }
    }
    calculatePlayerScores(){
        const { guessMax, timeScore } = this.gameProperties.scoreParams;
        for (const player of this.players.values()){
            const g = player.guesses.length;
            const t = Math.max(0, this.roundInfo.timeEnd - player.solveTime)/1000;
            let score = 0;
            if (player.solveTime){
                score = 1000 * (1 - (Math.min(g, guessMax) - 1) / guessMax) + timeScore * t / this.gameProperties.roundTime;
            }
            player.score = score;
            player.totalScore += score;
        }
    }
}
class RoundInfo {
    constructor(game){
        this.game = game;
        this.roundTime = game.gameProperties.roundTime;
        this.currRound = 0;
        this.timeEnd = 0;
        this.answer = [];
        this.finished = true;
    }
    newRound(){
        const game = this.game;
        if (!this.finished){
            return;
        }
        this.currRound += 1;
        this.timeStart = Date.now();
        this.timeEnd = this.timeStart + this.roundTime * 1000;
        this.answer = game.generateRandomAnswer();
        this.finished = false;
    }
    endRound(){
        this.finished = true;
    }
}
class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.sockets = new Set();
        this.gameCode = null;

        this.deleteTimeout = null;

        this.guesses = [];
        this.solveTime = 0;
        this.score = 0;
        this.totalScore = 0;
    }
    addGuess(guess, similarity, solved){
        this.guesses.push({guess, similarity});
        if (solved){
            this.solveTime = Date.now();
        }
    }
    resetGame(){
        this.guesses = [];
        this.solveTime = 0;
        this.score = 0;
        this.totalScore = 0;
    }
    resetRound(){
        this.guesses = [];
        this.solveTime = 0;
        this.score = 0;
    }
    setDeleteTimeout(callback){
        this.deleteTimeout = setTimeout(() => {
            callback();
        }, 60000);
    }
    clearDeleteTimeout(){
        if (this.deleteTimeout){
            clearTimeout(this.deleteTimeout);
            this.deleteTimeout = null;
        }
    }
    addSocket(socket) {
        this.sockets.add(socket);
    }
    removeSocket(socket) {
        this.sockets.delete(socket);
    }
    emit(event, data) {
        for (const socket of this.sockets) {
            socket.emit(event, data);
        }
    }
    setGameCode(code) {
        this.gameCode = code;
    }
}