import React from 'react';
import styled from 'styled-components';
import { NavLink, Route } from 'react-router-dom';
import ActiveTab from './active_tab_left.svg';

const StyledContainer = styled.div`
  display: flex;
  font-size: 18px;
`;

const StyledLinkContainer = styled.div`
  height: 34px;
  box-shadow: inset 0 2px 0 -1px #000, inset 0 -2px 0 -1px #000;

  &:first-child {
    box-shadow: inset 2px 0 0 -1px #000, inset 0 2px 0 -1px #000,
      inset 0 -2px 0 -1px #000;
    border-radius: 6px 0 0 6px;
    &:before {
      width: 14px;
    }

    &.active:before {
        background-position: 100%;
        width: 14px;
      }
    }
  }

  &:last-child {
    box-shadow: inset -2px 0 0 -1px #000, inset 0 2px 0 -1px #000,
      inset 0 -2px 0 -1px #000;
    border-radius: 0 6px 6px 0;
    &:after {
      width: 14px;
    }

    &.active:after {
        background-position: 100%;
        width: 14px;
      }
    }
  }

  &.active {
    padding: 0px;
    box-shadow: none;
    border-radius: 0px;
  }

  &:before {
    content: '';
    display: inline-block;
    width: 28px;
    height: 100%;
  }

  &:after {
    content: '';
    display: inline-block;
    width: 0px;
    height: 100%;
  }

  &:last-child:after {
    width: 14px;
  }

  &.active:before {
    content: '';
    background: url(${ActiveTab});
    display: inline-block;
    width: 28px;
  }

  &.active:after {
    content: '';
    background: url(${ActiveTab});
    display: inline-block;
    width: 28px;
    transform: matrix(-1, 0, 0, 1, 0, 0);
  }

  &.active + div:before {
    width: 0px;
  }
`;

const StyledNavLink = styled(NavLink)`
  color: #000;
  text-decoration: none;
  outline: none;
  vertical-align: top;

  &.active {
    border-radius: 0px;
    box-shadow: inset 0 2px 0 -1px #000;
    vertical-align: top;
    display: inline-block;
  }
`;

const LinkContainer = ({ to, path, ...rest }) => (
  <Route
    path={path || to}
    children={({ match }) => (
      <StyledLinkContainer className={match ? 'active' : ''}>
        <StyledNavLink to={to} {...rest} />
      </StyledLinkContainer>
    )}
  />
);

const Menu = ({ children, className }) => (
  <StyledContainer className={className}>
    <LinkContainer to="/" path="(/|/stats)">
      Stats
    </LinkContainer>
    <LinkContainer to="/members">Members</LinkContainer>
    <LinkContainer to="/governance">Governance</LinkContainer>
    <LinkContainer to="/points">Points</LinkContainer>
  </StyledContainer>
);

export default Menu;
