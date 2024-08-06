import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    selectProperties, selectGuesses, selectSolution,
    logGuess, setProperties, 
} from "../../store/slices/figure-it-out";
import Figure from "../figure";

import { StyledGuessesContainer } from "./style";
function GuessList(){
    const dispatch = useDispatch();
    const properties = useSelector(selectProperties);
    const guesses = useSelector(selectGuesses);
    const reversedGuesses = guesses.slice().map((guessScore, i) => {return {guessScore, i}}).reverse();
    return (
        <StyledGuessesContainer>
            {reversedGuesses.map(({guessScore, i}) => {
                const { guess, similarity } = guessScore;
                const simStr = `${'\u2705'.repeat(similarity)}${'\u274C'.repeat(properties.length - similarity)}`;
                return <div key={i}>
                    <Figure figureParams={guess.map((v, i) => properties[i].values[v])} />
                    <div>{simStr}</div>
                </div>
            })}
        </StyledGuessesContainer>
    );
}
export default GuessList;