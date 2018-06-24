import React from "react";
import styled from "styled-components";

import footer from "./footer.svg";

const StyledWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  padding: 20px;
`;
const StyledFooter = styled.img`
  height: 60px;
  background-color: #fff;
`;

const Footer = () => (
  <StyledWrapper>
    <StyledFooter src={footer} />
  </StyledWrapper>
);

export default Footer;
