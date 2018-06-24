import React from "react";
import styled from "styled-components";
import MetamaskLogo from "./metamask-logo-color.svg";

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

const Metamask = ({}) => (
  <MetamaskWrapper>
    <Title>Not without MetaMask</Title>
    <StyledLogo src={MetamaskLogo} />
    <p>You have to have MetaMask ready and logged in</p>
    <StyledLink href="https://metamask.io">https://metamask.io/</StyledLink>
  </MetamaskWrapper>
);

export default Metamask;
