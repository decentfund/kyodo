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

  handleAddToWhitelist = () => {
    const { userAddress } = this.props;
    var state = this.drizzle.store.getState();

    if (state.drizzleStatus.initialized) {
      // Unable to use cacheSend function due to external function drizzle smartcontract handling
      this.drizzle.contracts.KyodoDAO.methods
        .addToWhitelist(this.state.address)
        .send({ from: userAddress });
    }
  };

  render() {
    const { address } = this.state;
    const { canAdd, whitelistedAddresses } = this.props;
    return (
      <div>
        <StyledHeader>Colony Members</StyledHeader>
        {whitelistedAddresses.map(address => (
          <WhitelistedAddress value={address} key={address} />
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

Members.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = state => ({
  userAddress: state.accounts[0],
});

export default drizzleConnect(Members, mapStateToProps);
