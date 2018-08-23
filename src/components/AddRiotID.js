import React from 'react';
import styled from 'styled-components';
import FormattedAddress from './FormattedAddress';
import Input from './Input';
import Button from './Button';

const StyledContainer = styled.div`
  position: relative;
`;

const StyledHeader = styled.div`
  font-family: Roboto Mono;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  font-size: 24px;
  margin-bottom: 30px;
`;

const StyledAddressBox = styled.div`
  border: 1px solid #000000;
  box-sizing: border-box;
  border-radius: 5px;
  display: inline-block;
  height: 36px;
  line-height: 36px;
  padding: 0 12px;
  margin-bottom: 18px;
`;

const StyledArc = styled.div`
  background: none;
  border-left: 1px solid #000;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  display: inline-block;
  margin: 0 1em 1em 0;
  border-bottom-left-radius: 34px;
  border-top-left-radius: 34px;
  height: 34px;
  width: 17px;
  position: absolute;
  left: -17px;
  top: 28px;
`;

const AddRiotID = ({ address, alias }) => (
  <div>
    <StyledHeader>Attach a nickname to your address</StyledHeader>
    <StyledContainer>
      <StyledAddressBox>
        <FormattedAddress>{address}</FormattedAddress>
      </StyledAddressBox>
      <StyledArc />
      <Input label="your nickname:" />
    </StyledContainer>
    <div style={{ marginTop: '34px' }}>
      <Button active>Attach</Button>
    </div>
  </div>
);

export default AddRiotID;
