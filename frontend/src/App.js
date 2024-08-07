import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';

import MainMenu from './components/mainMenu';
import GameList from './components/gameList';
import GameScreen from './components/gameScreen';

import { 
  onJoinResponse, onGameList, onJoinGameResponse, onGamePropertiesUpdate, onPlayerJoinLeave, onRoundStart, onRoundEnd, onGameOver, onGuessResult
} from './ws';
import { 
  setJoinResponse, setGameListResponse, setJoinGameResponse, setGamePropertiesUpdate, setPlayerJoinLeave, setRoundStart, setRoundEnd, setGameOver, setGuessResult
} from './store/slices/figure-it-out';
import { selectScreen } from './store/slices/figure-it-out';
function App() {
  const dispatch = useDispatch();
  const screen = useSelector(selectScreen);
  console.log(screen);
  useEffect(() => {
    return onJoinResponse((data) => {
        dispatch(setJoinResponse(data));
    });
  });
  useEffect(() => {
    return onGameList((data) => {
        dispatch(setGameListResponse(data));
    });
  });
  useEffect(() => {
    return onJoinGameResponse((data) => {
        dispatch(setJoinGameResponse(data));
    });
  });
  useEffect(() => {
    return onGamePropertiesUpdate((data) => {
        dispatch(setGamePropertiesUpdate(data));
    });
  });
  useEffect(() => {
    return onPlayerJoinLeave((data) => {
        dispatch(setPlayerJoinLeave(data));
    });
  });
  useEffect(() => {
    return onRoundStart((data) => {
        dispatch(setRoundStart(data));
    });
  });
  useEffect(() => {
    return onRoundEnd((data) => {
        dispatch(setRoundEnd(data));
    });
  });
  useEffect(() => {
    return onGameOver((data) => {
        dispatch(setGameOver(data));
    });
  });
  useEffect(() => {
    return onGuessResult((data) => {
        dispatch(setGuessResult(data));
    });
  });
  return <div className="App" style={{margin : "10px"}}>
    {
      screen === 'menu' ? <MainMenu /> :
      screen === 'gameList' ? <GameList /> :
      screen === 'inGame' ? <GameScreen /> :
      null
    }
  </div>
}

export default App;
