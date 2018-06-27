import React from 'react';
import { ContractData } from 'drizzle-react-components';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import { getRate } from '../reducers';
import { formatEth, formatEur } from '../helpers/format';

const StyledLabel = styled.label`
  font-size: 12px;
`;

const StyledAmount = styled.div`
  font-size: 32px;
`;

const UserBalance = ({
  contractName,
  account,
  tokenPriceEUR,
  tokenPriceETH,
}) => (
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
      {formatEur(tokenPriceEUR)} {formatEth(tokenPriceETH)}
    </div>
  </div>
);

const mapStateToProps = (state, { account }) => ({
  tokenPriceEUR: getRate(state, 'DECENT', 'EUR'),
  tokenPriceETH: getRate(state, 'DECENT', 'ETH'),
});

export default drizzleConnect(UserBalance, mapStateToProps);
