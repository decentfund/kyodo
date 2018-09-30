import React from 'react';
import styled from 'styled-components';

const StyledContainer = styled.div`
  font-family: Roboto Mono;
  font-size: 14px;
  padding: 0 40px;
  line-height: 17px;
  margin-bottom: 12px;

  a {
    text-decoration: none;
    color: #000;
    display: inline-block;
    padding: 0 4px;

    &.active {
      background: #f5f905;
      border-radius: 3px;
    }
  }
`;

const Subnav = ({ children, className }) => (
  <StyledContainer className={className}>{children}</StyledContainer>
);

export default Subnav;
