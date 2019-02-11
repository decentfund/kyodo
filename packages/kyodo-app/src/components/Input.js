import React from 'react';
import styled from 'styled-components';
import { FramedDiv } from '../styles/common';

const StyledContainer = styled(FramedDiv)`
  width: ${props => props.width};
`;

const StyledInput = styled.input`
  height: 49px;
  padding: 20px 20px 0 0;
  border: 0px;
  margin: 0px;
  font-family: Roboto Mono;
  font-style: normal;
  font-weight: normal;
  line-height: normal;
  font-size: 24px;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
`;

const StyledLabel = styled.label`
  position: absolute;

  font-family: Roboto Mono;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  font-size: 13px;
  margin-top: 7px;
`;

const Input = ({ label, width, ...props }) => (
  <StyledContainer width={width}>
    <StyledLabel>{label}</StyledLabel>
    <StyledInput type="input" {...props} />
  </StyledContainer>
);

export default Input;
