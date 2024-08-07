import { createSlice } from '@reduxjs/toolkit';

function parseGame(game){
  const roundInfo = game.roundInfo;
  const out = {
    code: game.code,
    host_id: game.host_id,
    players: game.players.reduce((map, p) => {
      map[p.id] = p;
      return map;
    }, {}),
    gameProperties: game.gameProperties,
    roundInfo: {
      currRound: roundInfo.currRound,
      timeEnd: roundInfo.timeEnd,
      finished: roundInfo.finished,
      answer: null
    }
  };
  console.log(game, out);
  return out;
}
export const figureItOutSlice = createSlice({
  name: 'figureItOut',
  initialState: {
    id : 0,
    name : '',
    guesses : [],
    screen : 'menu', // menu, gameList, inGame
    gameList : [],
    game : {
    },
  },
  reducers: {
    setScreen : (state, action) => {
      state.screen = action.payload;
    },

    setJoinResponse: (state, action) => {
      const {id, name, game} = action.payload;
      state.id = id;
      state.name = name;
      if (game.code){
        state.game = parseGame(game);
      } else{
        state.game = {};
      }
    },
    setGameListResponse: (state, action) => {
      state.gameList = action.payload.games.map(parseGame);
    },
    setJoinGameResponse: (state, action) => {
      const {success, game} = action.payload;
      if (success){
        state.game = parseGame(game);
      }
    },
    setGamePropertiesUpdate: (state, action) => {
      state.game.gameProperties = action.payload;
    },
    setPlayerJoinLeave: (state, action) => {
      const {id, name, join} = action.payload;
      if (join){
        state.game.players[id] = {id, name, score : 0, totalScore : 0};
      } else{
        delete state.game.players[id];
      }
    },
    setRoundStart: (state, action) => {
      const { round, timeEnd } = action.payload;
      state.game.roundInfo = {
        currRound : round,
        timeEnd : timeEnd,
        finished : false,
        answer : null
      };
      state.guesses = [];
    },
    setRoundEnd: (state, action) => {
      const { round, solution, players } = action.payload;
      state.game.roundInfo = {
        currRound : round,
        timeEnd : null,
        finished : true,
        answer : solution
      };
      for (const player of players){
        state.game.players[player.id].score = player.score;
        state.game.players[player.id].totalScore = player.totalScore;
      }
    },
    setGameOver: (state, action) => {
      const { players } = action.payload;
      state.game.roundInfo = {
        currRound : 0,
        timeEnd : 0,
        finished : true,
        answer : null
      };
      for (const player of players){
        state.game.players[player.id].totalScore = player.totalScore;
      }
    },
    setGuessResult: (state, action) => {
      const { guess, similarity } = action.payload;
      state.guesses.push({ guess, similarity });
    }
  },
});

export const { setScreen, setJoinResponse, setGameListResponse, setJoinGameResponse, setGamePropertiesUpdate, setPlayerJoinLeave, setRoundStart, setRoundEnd, setGameOver, setGuessResult } = figureItOutSlice.actions;

export const selectScreen = state => state.figureItOut.screen;
export const selectGameList = state => state.figureItOut.gameList;
export const selectGuesses = state => state.figureItOut.guesses;
export const selectGame = state => state.figureItOut.game;
export const selectId = state => state.figureItOut.id;
export const selectName = state => state.figureItOut.name;
export default figureItOutSlice.reducer;
