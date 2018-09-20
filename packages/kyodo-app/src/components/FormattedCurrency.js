import React from 'react';
import styled from 'styled-components';

import { ETH, EUR, formatCurrency } from '../helpers/format';

const StyledSpan = styled.span`
  font-family: Roboto Mono;
`;

export const FormattedEth = ({ children, value }) => (
  <StyledSpan>
    {formatCurrency(value || children, ETH)}
    &thinsp;ETH
  </StyledSpan>
);
export const FormattedEur = ({ children: value }) => (
  <StyledSpan>
    {formatCurrency(value, EUR)}
    &thinsp;€
  </StyledSpan>
);
