import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { drizzleConnect } from 'drizzle-react';
import { LoadingContainer } from 'drizzle-react-components';
import MetamaskLogo from './metamask-logo-color.svg';

const MetamaskWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  line-height: 19px;
`;

const Title = styled.p`
  font-weight: 300;
  font-size: 32px;
`;
const StyledLogo = styled.img`
  margin: 30px;
  width: 120px;
`;

const StyledLink = styled.a`
  margin-top: 20px;
  font-size: 18px;
  line-height: 21px;
  color: #bd6fd8;
`;

const Metamask = () => (
  <MetamaskWrapper>
    <Title>Not without MetaMask</Title>
    <StyledLogo src={MetamaskLogo} />
    <p>You have to have MetaMask ready and logged in</p>
    <StyledLink href="https://metamask.io">https://metamask.io/</StyledLink>
  </MetamaskWrapper>
);

class LoadingMetamask extends Component {
  render() {
    if (this.props.web3.status === 'failed') {
      if (this.props.errorComp) {
        return <LoadingContainer {...this.props} />;
      }
      return <Metamask />;
    }

    if (
      this.props.web3.status === 'initialized' &&
      Object.keys(this.props.accounts).length === 0
    ) {
      return <Metamask />;
    }

    return <LoadingContainer {...this.props} />;
  }
}

LoadingMetamask.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    drizzleStatus: state.drizzleStatus,
    web3: state.web3,
  };
};

export default drizzleConnect(LoadingMetamask, mapStateToProps);
