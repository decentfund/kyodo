import React from 'react';
import styled from 'styled-components';
import DFIcon from './df_icon_bw.svg';
import PieIcon from './pie_icon.svg';

const StyledContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
`;

const StyledIconContainer = styled.div`
  width: 60px;
  text-align: center;
  margin: 0 0 0 20px;
`;

const MembersHeaderIcons = () => (
  <StyledContainer>
    <StyledIconContainer>
      <img src={DFIcon} alt="DF token balance" />
    </StyledIconContainer>
    <StyledIconContainer>
      <img src={PieIcon} alt="DF token share" />
    </StyledIconContainer>
  </StyledContainer>
);

export default MembersHeaderIcons;
