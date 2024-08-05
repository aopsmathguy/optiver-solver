import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logGuess, selectProperties, setProperties } from './store/slices/figure-it-out';
import './App.css';

import Figure from './components/figure';
import GuessList from './components/guessList';
import GuessCreator from './components/guessCreator';

import { onProperties, onGuessResult, emitGuess } from './ws';
function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    return onProperties((properties) => {
      console.log(properties);
      console.log(properties.properties);
      dispatch(setProperties(properties.properties));
    });
  });
  useEffect(() => {
    return onGuessResult((result) => {
      dispatch(logGuess(result));
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
