import React from "react";
import styled from "styled-components";
import propTypes from "prop-types";

import UserAlias from "./UserAlias.js";

const StyledWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 20px 40px 20px 40px;
`;

const StyledColonyName = styled.p`
  font-size: 18px;
  font-weight: bold;
  line-height: 21px;
`;

const Header = ({ colonyName, userAddress }) => (
  <StyledWrapper>
    <StyledColonyName href="/">{colonyName}</StyledColonyName>
    <UserAlias href="/user">{userAddress}</UserAlias>
  </StyledWrapper>
);

Header.defaultProps = {
  colonyName: "Colony Name",
  userAddress: "0x..."
};

Header.propTypes = {
  colonyName: propTypes.string,
  userAddress: propTypes.string
};

export default Header;
