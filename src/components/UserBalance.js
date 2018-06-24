import React from 'react';
import styled from 'styled-components';

const StyledLabel = styled.label`
  font-size: 12px;
`;

const StyledAmount = styled.div`
  font-size: 32px;
`;

const UserBalance = ({ amount, tokenSymbol }) => (
  <div>
    <StyledLabel>my balance</StyledLabel>
    <StyledAmount>
      {amount} {tokenSymbol}
    </StyledAmount>
  </div>
);

export default UserBalance;
