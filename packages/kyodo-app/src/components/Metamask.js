import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { drizzleConnect } from 'drizzle-react';
import { LoadingContainer } from 'drizzle-react-components';
import MetamaskLogo from './metamask-logo-color.svg';
import { getNetworkName } from '../helpers/network';
import { capitalize } from '../utils/string';

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

const WrongNetwork = props => (
  <MetamaskWrapper>
    <Title>Wrong network</Title>
    <StyledLogo src={MetamaskLogo} />
    <p>{props.children}</p>
  </MetamaskWrapper>
);

class LoadingMetamask extends Component {
  static defaultProps = {
    requiredNetwork: [
      'mainnet',
      'development', // allow local RPC for testing
    ],
  };

  render() {
    const { web3, errorComp, accounts, requiredNetwork } = this.props;

    if (web3.status === 'failed') {
      if (errorComp) {
        return <LoadingContainer {...this.props} />;
      }
      return <Metamask />;
    }

    if (web3.status === 'initialized' && web3.networkId) {
      const network = getNetworkName(web3.networkId);
      if (!requiredNetwork.includes(network)) {
        return (
          <WrongNetwork>
            {capitalize(requiredNetwork[0])} Test Net is your choice
          </WrongNetwork>
        );
      }
    }

    if (web3.status === 'initialized' && !Object.keys(accounts).length) {
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
