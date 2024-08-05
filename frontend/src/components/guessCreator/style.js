import styled from 'styled-components';
export const StyledButton = styled.button`
    padding: 10px;
    border: 0;
    mix-blend-mode: multiply;
    &.selected {
        background: rgba(0, 255, 0, 0.5);
    }
    &.unselected {
        background: rgba(0, 0, 0, 0);
    }
    &:hover {
        background: rgba(0, 0, 0, 0.5);
    }
`;
export const StyledGuessMakerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center; // Added this line to center the content horizontally
  flex-direction: row;
`;
export const PreviewGuessButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;