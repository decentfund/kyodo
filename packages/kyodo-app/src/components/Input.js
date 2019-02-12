import React from 'react';
import styled from 'styled-components';
import { FramedDiv } from '../styles/common';

const StyledContainer = styled.div`
  width: ${props => props.width};
  display: inline-block;
  vertical-align: top;
`;

const StyledInput = styled(FramedDiv)`
  height: 71px;
  padding: 20px 14px 0 14px;
  margin: 0px;
  font-family: Roboto Mono;
  font-style: normal;
  font-weight: normal;
  line-height: normal;
  font-size: 24px;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;

  box-shadow: ${props =>
    props.focusable ? '0px 0px 0px #f5f905' : '3px 3px 0px #f5f905'};

  &:active {
    box-shadow: 3px 3px 0px #f5f905;
  }

  &:focus {
    box-shadow: 3px 3px 0px #f5f905;
  }
`;

const StyledLabel = styled.label`
  position: absolute;

  font-family: Roboto Mono;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  font-size: 13px;
  margin-top: 7px;
  margin-left: 14px;
`;

const Input = ({ label, width, asComponent, ...props }) => (
  <StyledContainer width={width}>
    <StyledLabel for={props.id}>{label}</StyledLabel>
    <StyledInput as={asComponent || 'input'} type="input" {...props} />
  </StyledContainer>
);

export default Input;
