import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { StyledHeader } from './StyledSharedComponents';
import TokenBalance from './TokenBalance';
import Charts from './Charts';
import { getBalances, getFundBaseBalance } from '../reducers';

const StyledTokenBalances = styled.div`
  flex-grow: 1;
`;

const StyledContainer = styled.div`
  display: flex;
`;

const MultisigBalance = ({ balances, totalBalance }) => (
  <div>
    <StyledHeader>Fund stats</StyledHeader>
    <StyledContainer>
      <StyledTokenBalances>
        {balances
          .filter(({ balance }) => balance !== 0)
          .map(token => (
            <TokenBalance
              {...token}
              totalBalance={totalBalance}
              key={token.ticker}
            />
          ))}
      </StyledTokenBalances>
      <Charts />
    </StyledContainer>
  </div>
);

const mapStateToProps = state => {
  return {
    balances: getBalances(state).sort(
      (a, b) => b.balance * b.tokenPrice - a.balance * a.tokenPrice,
    ),
    totalBalance: getFundBaseBalance(state),
  };
};

export default connect(mapStateToProps)(MultisigBalance);
