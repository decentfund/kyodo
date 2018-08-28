import React from 'react';
import styled from 'styled-components';

const StyledContainer = styled.div`
  line-height: 20px;
`;

const StyledLabel = styled.span`
  background: #f5f905;
  border-radius: 3px;
  font-family: Roboto Condensed;
  font-style: normal;
  font-weight: 300;
  line-height: 8px;
  font-size: 8px;
  text-align: justify;
  text-transform: uppercase;
  width: 20px;
  display: inline-block;
  text-align: center;
  height: 10px;
  line-height: 10px;
  margin-right: 4px;
  vertical-align: middle;
`;

const StyledStatistics = styled.span`
  font-family: Roboto Mono;
  font-style: normal;
  font-weight: normal;
  line-height: normal;
  font-size: 12px;
  vertical-align: bottom;
`;

const StatisticsLabel = ({ label, children }) => (
  <StyledContainer>
    <StyledLabel>{label}</StyledLabel>
    <StyledStatistics>{children}</StyledStatistics>
  </StyledContainer>
);

export default StatisticsLabel;
