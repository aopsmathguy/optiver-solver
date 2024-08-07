import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    selectGame, selectGuesses
} from "../../store/slices/figure-it-out";
import Figure from "../figure";

import { StyledGuessesContainer } from "./style";
function GuessList(){
    const dispatch = useDispatch();
    const game = useSelector(selectGame);
    const figureParams = game?.gameProperties?.figureParams;

    const guesses = useSelector(selectGuesses);
    const reversedGuesses = guesses.slice().map((guessScore, i) => {return {guessScore, i}}).reverse();
    if (!game || !game.code){
        console.log("No game or game code");
        return null;
    }
    console.log("rendering");
    return (
        <StyledGuessesContainer>
            {reversedGuesses.map(({guessScore, i}) => {
                const { guess, similarity } = guessScore;
                const simStr = `${'\u2705'.repeat(similarity)}${'\u274C'.repeat(figureParams.length - similarity)}`;
                return <div key={i}>
                    <Figure params={figureParams} figureArguments={guess.map((v, i) => figureParams[i].values[v])} />
                    <div>{simStr}</div>
                </div>
            })}
        </StyledGuessesContainer>
    );
}
export default GuessList;