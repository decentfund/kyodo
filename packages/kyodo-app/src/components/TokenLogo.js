import React from "react";
import styled from "styled-components";
import token from "./token.svg";

const LogoWrapper = styled.img`
  width: 60px;
`;

const TokenLogo = ({ styles }) => <LogoWrapper src={token} />;

export default TokenLogo;
