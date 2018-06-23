import React from "react";
import styled from "styled-components";
import propTypes from "prop-types";

const Wrapper = styled.div`
  ${"" /* background-color: red; */};
`;

const StyledButton = styled.button`
  :hover {
    cursor: pointer;
  }
  margin: 10px;
  padding: 5px 12px 5px 12px;
  border-radius: 5px;
  font-size: 1.1rem;
  border: ${props => (props.active ? "1px solid black" : "none")};
  box-shadow: ${props => (props.profile ? "2px 2px #F5F905" : "none")};
`;

const Button = ({ ...props }) => (
  <Wrapper>
    <StyledButton {...props}>{props.children}</StyledButton>
  </Wrapper>
);

Button.defaultProps = {
  children: "BUTTON",
  profile: false,
  active: false
};

Button.propTypes = {
  children: propTypes.string,
  profile: propTypes.bool,
  active: propTypes.bool
};

export default Button;
