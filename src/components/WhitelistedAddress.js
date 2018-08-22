import React from 'react';
import styled from 'styled-components';
import FormattedAddress from './FormattedAddress';

const StyledContainer = styled.div`
  display: flex;
  width: 100%;
`;

const StyledDiv = styled.div`
  font-family: Roboto Mono;
  font-size: 18px;
  font-style: normal;
  font-weight: normal;
  line-height: normal;
  margin-bottom: 27px;
`;

const GRAY = 'rgba(0, 0, 0, 0.2)';
const BLACK = 'rgb(0, 0, 0)';

const StyledAlias = StyledDiv.extend`
  width: 170px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  color: ${props => (props.placeholder ? GRAY : BLACK)};
`;

const WhitelistedAddress = ({ alias, value }) => (
  <StyledContainer>
    <StyledAlias placeholder={!alias}>{alias || 'member known as'}</StyledAlias>
    <FormattedAddress>{value}</FormattedAddress>
  </StyledContainer>
);

export default WhitelistedAddress;
