import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';

import Input from './Input';
import Button from './Button';
import FormattedAddress from './FormattedAddress';
import { Header } from './Page';

import { getContract } from '../reducers';
import drizzleConnect from '../utils/drizzleConnect';

const StyledContainer = styled.div`
  position: relative;
  width: 430px;
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

class AddRiotID extends Component {
  constructor(props, context) {
    super(props, context);
    this.contracts = props.drizzle.contracts;
  }

  componentDidMount() {
    const dataKey = this.contracts.Members.methods.getAlias.cacheCall(
      this.props.account,
    );

    this.setState({ dataKey });
  }

  state = {
    alias: '',
  };

  onChange = ({ currentTarget: { value } }) => {
    this.setState({ alias: value, changed: true });
  };

  onSubmit = () => {
    this.contracts.Members.methods.setAlias.cacheSend(this.state.alias, {
      from: this.props.userAddress,
    });
  };

  render() {
    // TODO: Loading
    if (!this.state.dataKey) return null;

    const alias =
      this.props.Members &&
      this.props.Members.getAlias[this.state.dataKey] &&
      this.props.Members.getAlias[this.state.dataKey].value;

    const { account: address } = this.props;
    return (
      <div>
        <Header>Attach a riot alias to your address</Header>
        <StyledContainer>
          <StyledAddressBox>
            <FormattedAddress>{address}</FormattedAddress>
          </StyledAddressBox>
          <StyledArc />
          <Input
            label="your riot alias:"
            value={this.state.changed ? this.state.alias : alias}
            onChange={this.onChange}
          />
        </StyledContainer>
        <div style={{ marginTop: '34px' }}>
          <Button
            active={this.state.alias.length && this.state.changed}
            onClick={this.onSubmit}
          >
            Attach
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, { account }) => ({
  Members: getContract('Members')(state),
  userAddress: state.accounts[0],
});

export default compose(
  drizzleConnect,
  connect(mapStateToProps),
)(AddRiotID);
