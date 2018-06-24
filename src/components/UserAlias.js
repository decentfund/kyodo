import styled from 'styled-components';
import MetamaskLogo from './metamask-logo-color.svg';

const UserAlias = styled.a`
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid #000000;
  box-shadow: 3px 3px 0px #f5f905;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-block;
  font-family: Roboto Mono;
  font-size: 14px;
  font-style: normal;
  font-weight: normal;
  height: 34px;
  line-height: 34px;
  margin-bottom: 3px;
  padding: 0 14px;
  right: 3px;
  top: 8px;
  text-decoration: none;
  color: black;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    background: url(${MetamaskLogo});
    content: '';
    display: inline-block;
    height: 19px;
    margin: 7px 12px 0px 0px;
    vertical-align: top;
    width: 17px;
  }
`;

export default UserAlias;
