import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';

import ContractData from './ContractData';
import { FormattedEth, FormattedEur } from './FormattedCurrency';
import dfToken from './dftoken.svg';

import { formatDecimals } from '../helpers/format';
import drizzleConnect from '../utils/drizzleConnect';
import { getRate, getContract, getTotalSupply, getDecimals } from '../reducers';

const StyledUserBalance = styled.div`
  display: inline-block;
  vertical-align: top;
  width: 295px;
`;

const StyledLabel = styled.label`
  font-size: 12px;
`;

const StyledAmount = styled.span`
  font-size: 32px;
  font-family: Roboto Mono;
`;

const StyledConvertedAmount = styled.div`
  display: inline-block;
  margin-left: 9px;
`;

const StyledTokenLogo = styled.img`
  width: 66px;
  filter: drop-shadow(-4px 4px 0px #000);
`;

const StyledTokenLogoContainer = styled.div`
  display: inline-block;
  margin-right: 15px;
`;

const StyledBalance = styled.div`
  display: inline-block;
  vertical-align: top;
`;

class UserBalance extends Component {
  state = {};

  constructor(props, context) {
    super(props, context);
    this.contracts = props.drizzle.contracts;
  }

  componentDidMount() {
    const contract = this.contracts[this.props.contractName];

    const balanceKey = contract.methods.balanceOf.cacheCall(this.props.account);

    this.setState({
      balanceKey,
    });
  }

  render() {
    // TODO: Loading
    if (
      !this.props.totalSupply ||
      !this.state.balanceKey ||
      !this.props.Token.balanceOf[this.state.balanceKey] ||
      !this.props.decimals
    )
      return null;

    const { contractName, tokenPriceEUR, tokenPriceETH } = this.props;
    const balance = formatDecimals(
      this.props.Token.balanceOf[this.state.balanceKey].value,
      this.props.decimals,
    );

    return (
      <StyledUserBalance>
        <StyledTokenLogoContainer>
          <StyledTokenLogo src={dfToken} />
        </StyledTokenLogoContainer>
        <StyledBalance>
          <StyledLabel>my balance</StyledLabel>
          <div>
            <StyledAmount>
              {balance}
              &thinsp;
              <ContractData contract={contractName} method="symbol" />
            </StyledAmount>
            <StyledConvertedAmount>
              <div>
                <FormattedEth>{balance * tokenPriceETH}</FormattedEth>
              </div>
              <div>
                ~<FormattedEur>{balance * tokenPriceEUR}</FormattedEur>
              </div>
            </StyledConvertedAmount>
            <div>
              {((balance / this.props.totalSupply) * 100).toFixed(2)}% CAP
            </div>
          </div>
        </StyledBalance>
      </StyledUserBalance>
    );
  }
}

const mapStateToProps = (state, { account, contractName }) => ({
  tokenPriceEUR: getRate(state, 'DF', 'EUR'),
  tokenPriceETH: getRate(state, 'DF', 'ETH'),
  Token: getContract(contractName)(state),
  totalSupply: getTotalSupply(getContract(contractName)(state)),
  decimals: getDecimals(getContract(contractName)(state)),
});

export default compose(
  drizzleConnect,
  connect(mapStateToProps),
)(UserBalance);
