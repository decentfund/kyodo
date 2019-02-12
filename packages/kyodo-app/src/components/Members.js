import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';

import FormButton from './FormButton';
import { FormInput } from './Form';
import MembersHeaderIcons from './MembersHeaderIcons';
import WhitelistedAddress from './WhitelistedAddress';
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

  handleAddToWhitelist = () => {
    const { userAddress } = this.props;
    var state = this.drizzle.store.getState();

    if (state.drizzleStatus.initialized) {
      // Unable to use cacheSend function due to external function drizzle smartcontract handling
      this.drizzle.contracts.KyodoDAO.methods
        .addManyToWhitelist([this.state.address])
        .send({ from: userAddress });
    }
  };

  render() {
    const { address } = this.state;
    const { canAdd, whitelistedAddresses } = this.props;
    return (
      <div>
        <Header>Colony Members</Header>
        <MembersHeaderIcons />
        {whitelistedAddresses.map(address => (
          <WhitelistedAddress value={address} key={address} />
        ))}
        {canAdd ? (
          <StyledFormContainer>
            <div>
              <FormInput
                label="add new member:"
                value={address}
                onChange={this.handleAddressChange}
                placeholder="0x..."
                width="488px"
              />
            </div>
            <FormButton
              disabled={address.length === 0 || !isValidAddress(address)}
              onClick={this.handleAddToWhitelist}
            >
              Add
            </FormButton>
          </StyledFormContainer>
        ) : null}
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
