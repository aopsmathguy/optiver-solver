import { createSlice } from '@reduxjs/toolkit';

export const figureItOutSlice = createSlice({
  name: 'figureItOut',
  initialState: {
    properties: [],
    guesses : [],
    solution : null,
  },
  reducers: {
    setProperties: (state, action) => {
      state.properties = action.payload;
    },
    setGuesses: (state, action) => {
      state.guesses = action.payload;
    },
    logGuess: (state, action) => {
      const guessScore = action.payload;
      const { guess, similarity } = guessScore;
      state.guesses.push(guessScore);
      if (similarity === state.properties.length) {
        state.solution = guess;
      }
    }
  },
});

export const { setProperties, setGuesses, logGuess } = figureItOutSlice.actions;
export const selectProperties = (state) => state.figureItOut.properties;
export const selectGuesses = (state) => state.figureItOut.guesses;
export const selectSolution = (state) => state.figureItOut.solution;
export default figureItOutSlice.reducer;
