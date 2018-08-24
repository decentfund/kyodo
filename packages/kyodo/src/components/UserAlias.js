import MetamaskLogo from './metamask-logo-color.svg';
import { FramedLink } from '../styles/common';

const UserAlias = FramedLink.extend`
  cursor: pointer;
  height: 34px;
  max-width: 240px;
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
