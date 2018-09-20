import React from 'react';
import styled from 'styled-components';
import { formatCurrency, EUR } from '../helpers/format';

const StyledEurSymbol = styled.span`
  opacity: 0;
`;

const StyledShare = styled.div`
  width: ${props => `${props.width * 100}%`};
  background: rgba(0, 0, 0, 0.06);
  height: 13px;
  border-radius: 0px 8px 8px 0px;
  font-size: 10px;
  color: rgba(0, 0, 0, 0.4);
  padding-left: 4px;
`;

const StyledContainer = styled.div`
  margin-bottom: 12px;
  &:hover {
    ${StyledEurSymbol} {
      opacity: 1;
    }

    ${StyledShare} {
      background: #f5f905;
      color: #000;
    }
  }
`;

const StyledTokenHoldingsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  line-height: 16px;
  margin-bottom: 6px;
`;

const StyledTicker = styled.div`
  font-size: 16px;
  flex-grow: 1;
`;
const StyledHoldings = styled.div`
  font-size: 14px;
  text-align: right;
  color: rgba(0, 0, 0, 0.2);
  flex-grow: 2;
`;
const StyledValue = styled.div`
  font-size: 16px;
  width: 77px;
  margin-left: 20px;
  text-align: right;
`;

const TokenBalance = ({ ticker, balance, tokenPrice, totalBalance }) => {
  return (
    <StyledContainer>
      <StyledTokenHoldingsContainer>
        <StyledTicker>{ticker}</StyledTicker>
        <StyledHoldings>{balance}</StyledHoldings>
        <StyledValue>
          {formatCurrency(balance * tokenPrice, EUR)}{' '}
          <StyledEurSymbol>€</StyledEurSymbol>
        </StyledValue>
      </StyledTokenHoldingsContainer>
      <StyledShare width={(balance * tokenPrice) / totalBalance}>
        {(((balance * tokenPrice) / totalBalance) * 100).toFixed(2)}%
      </StyledShare>
    </StyledContainer>
  );
};

export default TokenBalance;
