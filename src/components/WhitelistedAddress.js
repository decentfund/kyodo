import React from 'react';
import styled from 'styled-components';

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

const StyledAlias = StyledDiv.extend`
  width: 245px;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-right: 15px;
`;

const StyledAddress = StyledDiv.extend`
  text-overflow: ellipsis;
  overflow: hidden;
  flex-grow: 1;
  text-align: right;
`;

const WhitelistedAddress = ({ alias, value }) => (
  <StyledContainer>
    <StyledAlias>{alias}</StyledAlias>
    <StyledAddress>{value}</StyledAddress>
  </StyledContainer>
);

export default WhitelistedAddress;
