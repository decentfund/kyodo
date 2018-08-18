import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ContractData } from 'drizzle-react-components';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import { getRate, getContract } from '../reducers';
import { formatEth, formatEur } from '../helpers/format';
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
      <StyledUserBalance>
        <StyledTokenLogoContainer>
          <StyledTokenLogo src={dfToken} />
        </StyledTokenLogoContainer>
        <StyledBalance>
          <StyledLabel>my balance</StyledLabel>
          <StyledAmount>
            <ContractData
              contract={contractName}
              method="balanceOf"
              methodArgs={[account]}
            />{' '}
            <ContractData contract={contractName} method="symbol" />
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
