import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import { StyledHeader } from './StyledSharedComponents';
import TokenBalance from './TokenBalance';
import { getBalances, getFundBaseBalance } from '../reducers';

const StyledTokenBalances = styled.div`
  width: 290px;
`;

class MultisigBalance extends Component {
  render() {
    return (
      <div>
        <StyledHeader>Fund stats</StyledHeader>
        <StyledTokenBalances>
          {this.props.balances
            .filter(({ balance }) => balance !== 0)
            .map(token => (
              <TokenBalance
                {...token}
                totalBalance={this.props.totalBalance}
                key={token.ticker}
              />
            ))}
        </StyledTokenBalances>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    balances: getBalances(state).sort(
      (a, b) => b.balance * b.tokenPrice - a.balance * a.tokenPrice,
    ),
    totalBalance: getFundBaseBalance(state),
  };
};

export default drizzleConnect(MultisigBalance, mapStateToProps);
