import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setScreen, selectGameList, selectGuesses, selectGame, selectId, selectName } from '../../store/slices/figure-it-out';
import { sendGetGameList, sendNewGame, sendJoinGame } from '../../ws';
const GameList = () => {
    const dispatch = useDispatch();
    const gameList = useSelector(selectGameList);
    const id = useSelector(selectId);
    const name = useSelector(selectName);
    useEffect(() => {
        sendGetGameList();
    }, []);
    const handleRefreshClick = () => {
        sendGetGameList();
    }
    const handleNewGameClick = () => {
        sendNewGame();
        dispatch(setScreen('inGame'));
    };
    const handleJoinGameClick = (code) => {
        sendJoinGame({
            code: code
        });
        dispatch(setScreen('inGame'));
    };
    return (
        <div>
            <h1>Game List</h1>
            <button onClick={handleRefreshClick}>Refresh</button>
            <button onClick={handleNewGameClick}>New Game</button>
            <ul>
                {gameList && gameList.map((game, i) => (
                    <li key={i}>
                        <span>{Object.values(game.players).length} players: {Object.values(game.players).map(player => player.name).join(', ')}</span> 
                        <span>Round {game.roundInfo.currRound}</span>
                        <button onClick={() => handleJoinGameClick(game.code)}>Join</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default GameList;