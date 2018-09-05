import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { drizzleConnect } from 'drizzle-react';
import { ContractData } from 'drizzle-react-components';
import { getRate, getContract } from '../reducers';
import { FormattedEth, FormattedEur } from './FormattedCurrency';

const StyledTotalSupplyChange = styled.div`
  background: #f7ffc7;
  border-radius: 6px;
  display: inline-block;
  font-size: 12px;
  padding: 3px 13px 5px;
  vertical-align: top;
  width: 172px;
`;

const StyledHeader = styled.header`
  margin-bottom: 3px;
`;

const StyledSupplyChange = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const StyledChangeCurrency = styled.div`
  font-size: 14px;
`;

class TotalSupplyChange extends Component {
  constructor(props, context) {
    super(props, context);
    this.contracts = context.drizzle.contracts;
    this.dataKey = this.contracts.DecentToken.methods.totalSupply.cacheCall();
    this.prevDataKey = this.contracts.DecentToken.methods.totalSupply.cacheCall(
      { from: this.props.userAddress },
      this.props.prevBlock,
    );
  }

  render() {
    // TODO: Loading
    if (
      !this.prevDataKey ||
      !this.props.DecentToken.totalSupply[this.prevDataKey] ||
      !this.dataKey ||
      !this.props.DecentToken.totalSupply[this.dataKey]
    )
      return null;

    const prevSupply = this.props.DecentToken.totalSupply[this.prevDataKey]
      .value;
    const totalSupply = this.props.DecentToken.totalSupply[this.dataKey].value;
    const change = totalSupply - prevSupply;

    const { contractName, tokenPriceEUR, tokenPriceETH } = this.props;
    return (
      <StyledTotalSupplyChange>
        <StyledHeader>change</StyledHeader>
        <StyledSupplyChange>
          {change > 0 ? `+${change}` : change}{' '}
          <ContractData contract={contractName} method="symbol" />
        </StyledSupplyChange>
        <StyledChangeCurrency>
          <FormattedEth>{change * tokenPriceETH}</FormattedEth>{' '}
          <FormattedEur>{change * tokenPriceEUR}</FormattedEur>
        </StyledChangeCurrency>
      </StyledTotalSupplyChange>
    );
  }
}

TotalSupplyChange.defaultProps = {
  contractName: 'DecentToken',
};

TotalSupplyChange.propTypes = {};

TotalSupplyChange.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = state => ({
  DecentToken: getContract('DecentToken')(state),
  userAddress: state.accounts[0],
  tokenPriceEUR: getRate(state, 'DF', 'EUR'),
  tokenPriceETH: getRate(state, 'DF', 'ETH'),
});

export default drizzleConnect(TotalSupplyChange, mapStateToProps);
