import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setGuesses, logGuess, selectProperties, setProperties } from './store/slices/figure-it-out';
import './App.css';

import Figure from './components/figure';
import GuessList from './components/guessList';
import GuessCreator from './components/guessCreator';

import { onProperties, onGuessResult, onNextGuess, emitGuess } from './ws';
function App() {
  const dispatch = useDispatch();
  const properties = useSelector(selectProperties);
  useEffect(() => {
    return onProperties((properties) => {
      dispatch(setProperties(properties.properties));
      dispatch(setGuesses([]));
    });
  });
  useEffect(() => {
    return onGuessResult((result) => {
      dispatch(logGuess(result));
    });
  });
  useEffect(() => {
    return onNextGuess((result) => {
      const {guess, bits} = result;
      console.log(guess.map((v, i) => properties[i].values[v]), bits);
    });
  });
  return (
    <div className="App">
      <GuessCreator />
      <GuessList />
    </div>
  );
}

export default App;
