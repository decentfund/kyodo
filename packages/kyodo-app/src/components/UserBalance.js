import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ContractData } from 'drizzle-react-components';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import { getRate, getContract, getTotalSupply, getDecimals } from '../reducers';
import { FormattedEth, FormattedEur } from './FormattedCurrency';
import { formatDecimals } from '../helpers/format';
import dfToken from './dftoken.svg';

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
    this.contracts = context.drizzle.contracts;
  }

  componentDidMount() {
    const contract = this.contracts.Token;

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
              {(
                (this.props.Token.balanceOf[this.state.balanceKey].value /
                  this.props.totalSupply) *
                100
              ).toFixed(2)}
              % CAP
            </div>
          </div>
        </StyledBalance>
      </StyledUserBalance>
    );
  }
}

UserBalance.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = (state, { account }) => ({
  tokenPriceEUR: getRate(state, 'DF', 'EUR'),
  tokenPriceETH: getRate(state, 'DF', 'ETH'),
  Token: getContract('Token')(state),
  totalSupply: getTotalSupply(getContract('Token')(state)),
  decimals: getDecimals(getContract('Token')(state)),
});

export default drizzleConnect(UserBalance, mapStateToProps);
