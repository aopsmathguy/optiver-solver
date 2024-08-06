import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectProperties } from "../../store/slices/figure-it-out";
import PropertyIcon from "../propertyIcon";

import { StyledButton, StyledGuessMakerContainer,PreviewGuessButtonContainer, StyledButtonRow } from "./style";
import Figure from "../figure";

import { emitGuess } from "../../ws";
function GuessCreator() {
    const properties = useSelector(selectProperties);
    const [currentGuess, setCurrentGuess] = useState([]);
    const currentGuessString = currentGuess.map((v, i) => properties[i].values[v]);
    useEffect(() => {
        if (properties.length > 0) {
            setCurrentGuess(new Array(properties.length).fill(0));
        }
    }, [properties]);

    const setCurrentGuessValue = (i, value) => {
        setCurrentGuess(currentGuess =>
            currentGuess.map((v, j) => (i === j ? value : v))
        );
    };
    const sendGuess = () => {
        emitGuess(currentGuess);
    };
    

    if (!properties.length) return null;
    return (<StyledGuessMakerContainer>
        <div>
            {properties.map(({ property, values }, i) => (
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
            <Figure figureParams={currentGuessString} />
            <button onClick={sendGuess}>Guess</button>
        </PreviewGuessButtonContainer>
    </StyledGuessMakerContainer>
    );
}

export default GuessCreator;