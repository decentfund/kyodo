import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { drizzleConnect } from 'drizzle-react';
import { ContractData } from 'drizzle-react-components';
import { getRate, getContract } from '../reducers';
import {
  formatEth,
  formatEur,
  formatCurrency,
  formatDecimals,
} from '../helpers/format';

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
  state = {};

  constructor(props, context) {
    super(props, context);
    this.contracts = context.drizzle.contracts;
  }

  componentDidMount() {
    const contract = this.contracts.DecentToken;

    const dataKey = contract.methods.totalSupply.cacheCall();
    const prevDataKey = contract.methods.totalSupply.cacheCall(
      { from: this.props.userAddress },
      this.props.prevBlock,
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
      !this.props.DecentToken.totalSupply[this.state.prevDataKey] ||
      !this.state.dataKey ||
      !this.props.DecentToken.totalSupply[this.state.dataKey] ||
      !this.state.decimalsKey ||
      !this.props.DecentToken.decimals[this.state.decimalsKey]
    )
      return null;

    const decimals = this.props.DecentToken.decimals[this.state.decimalsKey]
      .value;
    const prevSupply = formatDecimals(
      this.props.DecentToken.totalSupply[this.state.prevDataKey].value,
      decimals,
    );
    const totalSupply = formatDecimals(
      this.props.DecentToken.totalSupply[this.state.dataKey].value,
      decimals,
    );
    const change = formatCurrency(totalSupply - prevSupply, 'DF', 3);

    const { contractName, tokenPriceEUR, tokenPriceETH } = this.props;
    return (
      <StyledTotalSupplyChange>
        <StyledHeader>change</StyledHeader>
        <StyledSupplyChange>
          {change > 0 ? `+${change}` : change}{' '}
          <ContractData contract={contractName} method="symbol" />
        </StyledSupplyChange>
        <StyledChangeCurrency>
          {formatEur(change * tokenPriceEUR)}{' '}
          {formatEth(change * tokenPriceETH)}
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
