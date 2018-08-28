import React from 'react';
import styled from 'styled-components';

const StyledContainer = styled.div`
  border: ${props =>
    props.disabled ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid #000000'};
  box-sizing: border-box;
  border-radius: 6px 8px 8px 8px;
  padding: 3px 5px 5px 3px;
  display: inline-block;
`;

const StyledButton = styled.button`
  border: 0px;
  background: ${props => (props.disabled ? 'rgba(0, 0, 0, 0.06)' : '#f5f905')};
  border-radius: 6px 8px 8px 8px;
  height: 32px;
  min-width: 125px;
`;

const FormButton = ({ children, disabled, ...props }) => (
  <StyledContainer disabled={disabled}>
    <StyledButton disabled={disabled} {...props}>
      {children}
    </StyledButton>
  </StyledContainer>
);

export default FormButton;
