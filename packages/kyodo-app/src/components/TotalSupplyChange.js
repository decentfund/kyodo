import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { compose } from 'redux';

import ContractData from './ContractData';
import { FormattedEth, FormattedEur } from './FormattedCurrency';

import { getRate, getContract } from '../reducers';
import { formatCurrency, formatDecimals } from '../helpers/format';
import drizzleConnect from '../utils/drizzleConnect';

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
  font-family: Roboto Mono;
`;

const StyledChangeCurrency = styled.div`
  font-size: 14px;
`;

class TotalSupplyChange extends Component {
  state = {};

  constructor(props, context) {
    super(props, context);
    this.contracts = props.drizzle.contracts;
  }

  componentDidMount() {
    const contract = this.contracts.Token;

    const dataKey = contract.methods.totalSupply.cacheCall();
    const prevDataKey = contract.methods.totalSupply.cacheCall(
      { from: this.props.userAddress },
      this.props.prevBlock.toString(),
    );
    const decimalsKey = contract.methods.decimals.cacheCall();

    this.setState({
      dataKey,
      prevDataKey,
      decimalsKey,
    });
  }

  render() {
    // TODO: Loading
    if (
      !this.state.prevDataKey ||
      !this.props.Token.totalSupply[this.state.prevDataKey] ||
      !this.state.dataKey ||
      !this.props.Token.totalSupply[this.state.dataKey] ||
      !this.state.decimalsKey ||
      !this.props.Token.decimals[this.state.decimalsKey]
    )
      return null;

    const decimals = this.props.Token.decimals[this.state.decimalsKey].value;
    const prevSupply = formatDecimals(
      this.props.Token.totalSupply[this.state.prevDataKey].value,
      decimals,
    );
    const totalSupply = formatDecimals(
      this.props.Token.totalSupply[this.state.dataKey].value,
      decimals,
    );
    const change = formatCurrency(totalSupply - prevSupply, 'DF', 3);

    const { contractName, tokenPriceEUR, tokenPriceETH } = this.props;
    return (
      <StyledTotalSupplyChange>
        <StyledHeader>change</StyledHeader>
        <StyledSupplyChange>
          {change > 0 ? `+${change}` : change}
          &thinsp;
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
  contractName: 'Token',
};

TotalSupplyChange.propTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = state => ({
  Token: getContract('Token')(state),
  userAddress: state.accounts[0],
  tokenPriceEUR: getRate(state, 'DF', 'EUR'),
  tokenPriceETH: getRate(state, 'DF', 'ETH'),
});

export default compose(
  drizzleConnect,
  connect(mapStateToProps),
)(TotalSupplyChange);
