import React from 'react';
import { ContractData } from 'drizzle-react-components';
import styled from 'styled-components';

const StyledLabel = styled.label`
  font-size: 12px;
`;

const StyledAmount = styled.div`
  font-size: 32px;
`;

const UserBalance = ({ contractName, account }) => (
  <div>
    <StyledLabel>my balance</StyledLabel>
    <StyledAmount>
      <ContractData
        contract={contractName}
        method="totalSupply"
        methodArgs={[{ from: account }]}
      />{' '}
      <ContractData contract={contractName} method="symbol" />
    </StyledAmount>
  </div>
);

export default UserBalance;
