import React, { Component } from 'react';
import styled from 'styled-components';
import { FormattedPlural } from 'react-intl';
import pointsIcon from './points_icon.svg';

const StyledContainer = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.15);
  padding-top: 9px;
  font-size: 16px;
  margin-bottom: 40px;
`;

const StyledPointsIcon = styled.img`
  vertical-align: middle;
`;

const StyledDomainsPoints = styled.span`
  margin-left: 19px;
`;

class Earnings extends Component {
  constructor(props, context) {
    super(props, context);
  }

  state = {
    points: [],
  };

  render() {
    const totalPoints = this.state.points.reduce((a, p) => a + p.value, 0);
    return (
      <StyledContainer>
        you earned <StyledPointsIcon src={pointsIcon} /> {totalPoints}{' '}
        <FormattedPlural value={totalPoints} one="point" other="points" />
        <StyledDomainsPoints>
          {this.state.points.map(p => (
            <span>
              {p.value}@{p.domain.toLowerCase()}{' '}
            </span>
          ))}
        </StyledDomainsPoints>
      </StyledContainer>
    );
  }
}

export default Earnings;
