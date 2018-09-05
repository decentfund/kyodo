import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import { getContract } from '../reducers';
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

class AddRiotID extends Component {
  constructor(props, context) {
    super(props, context);
    this.contracts = context.drizzle.contracts;
    this.dataKey = this.contracts.KyodoDAO.methods.getAlias.cacheCall(
      this.props.account,
    );
  }

  state = {
    alias: '',
  };

  onChange = ({ currentTarget: { value } }) => {
    this.setState({ alias: value, changed: true });
  };

  onSubmit = () => {
    this.contracts.KyodoDAO.methods.setAlias.cacheSend(this.state.alias);
  };

  render() {
    // TODO: Loading
    if (!this.dataKey || !this.props.KyodoDAO.getAlias[this.dataKey])
      return null;

    const alias = this.props.KyodoDAO.getAlias[this.dataKey].value;

    const { account: address } = this.props;
    return (
      <div>
        <StyledHeader>Attach a nickname to your address</StyledHeader>
        <StyledContainer>
          <StyledAddressBox>
            <FormattedAddress>{address}</FormattedAddress>
          </StyledAddressBox>
          <StyledArc />
          <Input
            label="your nickname:"
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

AddRiotID.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = (state, { account }) => ({
  KyodoDAO: getContract('KyodoDAO')(state),
});

export default drizzleConnect(AddRiotID, mapStateToProps);
