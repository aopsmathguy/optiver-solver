import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectGame } from "../../store/slices/figure-it-out";
import PropertyIcon from "../propertyIcon";

import { StyledButton, StyledGuessMakerContainer,PreviewGuessButtonContainer, StyledButtonRow } from "./style";
import Figure from "../figure";

import { sendGuess } from '../../ws';
function GuessCreator() {
    const game = useSelector(selectGame);
    const figureParams = game?.gameProperties?.figureParams;
    const [currentGuess, setCurrentGuess] = useState(figureParams ? figureParams.map(() => 0) : []);
    const currentGuessString = currentGuess.map((v, i) => figureParams[i].values[v]);

    const setCurrentGuessValue = (i, value) => {
        setCurrentGuess(currentGuess =>
            currentGuess.map((v, j) => (i === j ? value : v))
        );
    };
    const makeGuess = () => {
        sendGuess({
            guess : currentGuess
        });
    };
    

    if (!game || !game.code) return null;
    if (!figureParams || !figureParams.length) return null;
    return (<StyledGuessMakerContainer>
        <div>
            {figureParams.map(({ property, values }, i) => (
                <StyledButtonRow key={i}>
                    {values.map((value, j) => (
                        <StyledButton key={j} onClick={() => setCurrentGuessValue(i, j)} className={currentGuess[i] == j ? 'selected' : 'unselected'}>
                            <PropertyIcon property={property} value={value} />
                        </StyledButton>
                    ))}
                </StyledButtonRow>
            ))}
        </div>
        <PreviewGuessButtonContainer>
            <Figure params={
                figureParams
            } figureArguments={currentGuessString}  />
            <button onClick={makeGuess}>Guess</button>
        </PreviewGuessButtonContainer>
    </StyledGuessMakerContainer>
    );
}

export default GuessCreator;