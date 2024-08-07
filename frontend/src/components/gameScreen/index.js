import React from 'react';
import GuessCreator from '../guessCreator';
import GuessList from '../guessList';
import RoundEnd from '../roundEnd';
import { useSelector } from 'react-redux';
import { selectGame } from '../../store/slices/figure-it-out';
function GameScreen() {
    const game = useSelector(selectGame);
    const roundInfo = game?.roundInfo;
    const roundFinished = roundInfo?.finished;
    return (
        <div className='gameScreen'>
            { roundInfo && roundFinished ? <RoundEnd />:
            <><GuessCreator />
            <GuessList /></>}
        </div>
    );
}

export default GameScreen;