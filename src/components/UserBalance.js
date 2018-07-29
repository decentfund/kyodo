import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ContractData } from 'drizzle-react-components';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import { getRate, getContract } from '../reducers';
import { formatEth, formatEur } from '../helpers/format';

const StyledLabel = styled.label`
  font-size: 12px;
`;

const StyledAmount = styled.div`
  font-size: 32px;
`;

class UserBalance extends Component {
  constructor(props, context) {
    super(props, context);
    this.contracts = context.drizzle.contracts;
    this.dataKey = this.contracts.DecentToken.methods.balanceOf.cacheCall(
      this.props.account,
    );
  }

  render() {
    // TODO: Loading
    if (!this.dataKey || !this.props.DecentToken.balanceOf[this.dataKey])
      return null;

    const { contractName, account, tokenPriceEUR, tokenPriceETH } = this.props;
    const balance = this.props.DecentToken.balanceOf[this.dataKey].value;
    return (
      <div>
        <StyledLabel>my balance</StyledLabel>
        <StyledAmount>
          <ContractData
            contract={contractName}
            method="balanceOf"
            methodArgs={[account, { from: account }]}
          />{' '}
          <ContractData contract={contractName} method="symbol" />
        </StyledAmount>
        <div>
          {formatEur(balance * tokenPriceEUR)}{' '}
          {formatEth(balance * tokenPriceETH)}
        </div>
      </div>>
    );
  }
}

UserBalance.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = (state, { account }) => ({
  tokenPriceEUR: getRate(state, 'DF', 'EUR'),
  tokenPriceETH: getRate(state, 'DF', 'ETH'),
  DecentToken: getContract('DecentToken')(state),
});

export default drizzleConnect(UserBalance, mapStateToProps);
