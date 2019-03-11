import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { FormInput as Input } from './Form';
import FormButton from './FormButton';
import { Header } from './Page';

import { isValidAddress } from '../helpers';
import drizzleConnect from '../utils/drizzleConnect';

const StyledFormContainer = styled.div`
  margin-top: 20px;
`;

class Members extends Component {
  state = { address: '' };

  constructor(props, context) {
    super(props);

    this.drizzle = props.drizzle;
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
      this.tx = this.drizzle.contracts.Token.methods
        .mint(this.state.address, this.state.amount)
        .send({ from: userAddress });
    }
  };

  render() {
    const { address, amount } = this.state;
    console.log(this.tx);
    return (
      <div>
        <Header>Mint tokens</Header>
        <StyledFormContainer>
          <div>
            <Input
              label="enter ethereum address:"
              value={address}
              onChange={this.handleAddressChange}
              placeholder="0x..."
              width="488px"
            />
          </div>
          <div>
            <Input
              label="token amount to issue:"
              value={amount}
              onChange={this.handleAmountChange}
              placeholder="1"
              width="488px"
            />
          </div>
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

const mapStateToProps = state => ({
  userAddress: state.accounts[0],
});

export default compose(
  drizzleConnect,
  connect(mapStateToProps),
)(Members);
