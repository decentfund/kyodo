import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ContractData } from 'drizzle-react-components';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import { getRate, getContract } from '../reducers';
import { FormattedEth, FormattedEur } from './FormattedCurrency';
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
  constructor(props, context) {
    super(props, context);
    this.contracts = context.drizzle.contracts;
    this.dataKey = this.contracts.DecentToken.methods.balanceOf.cacheCall(
      this.props.account,
    );
    this.totalSupplyKey = this.contracts.DecentToken.methods.totalSupply.cacheCall();
  }

  render() {
    // TODO: Loading
    if (
      !this.dataKey ||
      !this.props.DecentToken.balanceOf[this.dataKey] ||
      !this.totalSupplyKey ||
      !this.props.DecentToken.totalSupply[this.totalSupplyKey]
    )
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
          <div>
            <StyledAmount>
              <ContractData
                contract={contractName}
                method="balanceOf"
                methodArgs={[account]}
              />{' '}
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
                (this.props.DecentToken.balanceOf[this.dataKey].value /
                  this.props.DecentToken.totalSupply[this.totalSupplyKey]
                    .value) *
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
  DecentToken: getContract('DecentToken')(state),
});

export default drizzleConnect(UserBalance, mapStateToProps);
