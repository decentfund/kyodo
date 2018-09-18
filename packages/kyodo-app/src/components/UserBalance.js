import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ContractData } from 'drizzle-react-components';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import { getRate, getContract } from '../reducers';
import { formatEth, formatEur, formatDecimals } from '../helpers/format';
import dfToken from './dftoken.svg';

const StyledUserBalance = styled.div`
  display: inline-block;
  vertical-align: top;
  width: 260px;
`;

const StyledLabel = styled.label`
  font-size: 12px;
`;

const StyledAmount = styled.div`
  font-size: 32px;
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
`;

class UserBalance extends Component {
  state = {};

  constructor(props, context) {
    super(props, context);
    this.contracts = context.drizzle.contracts;
  }

  componentDidMount() {
    const contract = this.contracts.DecentToken;

    const balanceKey = contract.methods.balanceOf.cacheCall(this.props.account);
    const decimalsKey = contract.methods.decimals.cacheCall();

    this.setState({
      balanceKey,
      decimalsKey,
    });
  }

  render() {
    // TODO: Loading
    if (
      !this.state.balanceKey ||
      !this.props.DecentToken.balanceOf[this.state.balanceKey] ||
      !this.state.decimalsKey ||
      !this.props.DecentToken.decimals[this.state.decimalsKey]
    )
      return null;

    const { contractName, tokenPriceEUR, tokenPriceETH } = this.props;
    const balance = formatDecimals(
      this.props.DecentToken.balanceOf[this.state.balanceKey].value,
      this.props.DecentToken.decimals[this.state.decimalsKey].value,
    );

    return (
      <StyledUserBalance>
        <StyledTokenLogoContainer>
          <StyledTokenLogo src={dfToken} />
        </StyledTokenLogoContainer>
        <StyledBalance>
          <StyledLabel>my balance</StyledLabel>
          <StyledAmount>
            {balance} <ContractData contract={contractName} method="symbol" />
          </StyledAmount>
          <div>
            {formatEur(balance * tokenPriceEUR)}{' '}
            {formatEth(balance * tokenPriceETH)}
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
  DecentToken: getContract('DecentToken')(state),
});

export default drizzleConnect(UserBalance, mapStateToProps);
