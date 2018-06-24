import React, { Component } from 'react';
import styled from 'styled-components';
import Input from './Input';
import WhitelistedAddress from './WhitelistedAddress';
import FormButton from './FormButton';

const StyledHeader = styled.header`
  font-size: 24px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
  margin-bottom: 34px;
`;

const StyledFormContainer = styled.div`
  margin-top: 20px;
`;

const StyledInputContainer = styled.div`
  margin-bottom: 28px;
`;

class Members extends Component {
  state = { address: '' };

  handleAddressChange = e => {
    this.setState({ address: e.target.value });
  };

  render() {
    const { address } = this.state;
    const { canAdd } = this.props;
    // const { whitelistedAddresses, canAdd } = this.props;
    const whitelistedAddresses = [
      {
        value: '0xf74757e788a81350210ef041a79a18e478903559',
        alias: 'lena_p',
      },
      {
        value: '0×cECbdAA3F5b649fAE34654637a3A856f4E2311ab',
        alias: '',
      },
      {
        value: '0×06012c8cf97Bead5deAe237070f9587f8B7a266e',
        alias: 'poluelene_polunatasha',
      },
    ];
    return (
      <div>
        <StyledHeader>Colony Members</StyledHeader>
        {whitelistedAddresses.map(address => (
          <WhitelistedAddress {...address} key={address.value} />
        ))}
        {canAdd ? (
          <StyledFormContainer>
            <StyledInputContainer>
              <Input
                label="add new member:"
                value={address}
                onChange={this.handleAddressChange}
                placeholder="0x..."
                width="488px"
              />
            </StyledInputContainer>
            <FormButton
              disabled={this.state.address.length === 0}
              onClick={this.addToWhitelist}
            >
              Add
            </FormButton>
          </StyledFormContainer>
        ) : null}
      </div>
    );
  }
}

export default Members;
