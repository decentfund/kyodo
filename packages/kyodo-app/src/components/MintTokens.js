import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import Input from './Input';
import WhitelistedAddress from './WhitelistedAddress';
import FormButton from './FormButton';
import { isValidAddress } from '../helpers';

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

  constructor(props, context) {
    super(props);

    this.drizzle = context.drizzle;
  }

  handleAddressChange = e => {
    this.setState({ address: e.target.value });
  };

  handleAmountChange = e => {
    this.setState({ amount: e.target.value });
  };

  handleMintTokens = () => {
    const { userAddress } = this.props;
    var state = this.drizzle.store.getState();

    if (state.drizzleStatus.initialized) {
      // Unable to use cacheSend function due to external function drizzle smartcontract handling
      this.tx = this.drizzle.contracts.DecentToken.methods
        .mint(this.state.address, this.state.amount)
        .send({ from: userAddress });
    }
  };

  render() {
    const { address, amount } = this.state;
    console.log(this.tx);
    return (
      <div>
        <StyledHeader>Mint tokens</StyledHeader>
        <StyledFormContainer>
          <StyledInputContainer>
            <Input
              label="enter ethereum address:"
              value={address}
              onChange={this.handleAddressChange}
              placeholder="0x..."
              width="488px"
            />
          </StyledInputContainer>
          <StyledInputContainer>
            <Input
              label="token amount to issue:"
              value={amount}
              onChange={this.handleAmountChange}
              placeholder="1"
              width="488px"
            />
          </StyledInputContainer>
          <FormButton
            disabled={
              address.length === 0 || !isValidAddress(address) || amount === 0
            }
            onClick={this.handleMintTokens}
          >
            Add
          </FormButton>
        </StyledFormContainer>
      </div>
    );
  }
}

Members.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = state => ({
  userAddress: state.accounts[0],
});

export default drizzleConnect(Members, mapStateToProps);
