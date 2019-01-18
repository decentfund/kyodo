import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FormattedPlural } from 'react-intl';
import pointsIcon from './points_icon.svg';
import { getTipsByDomain } from '../reducers';

const StyledContainer = styled.div`
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
  render() {
    const { total, ...points } = this.props.points;
    return (
      <StyledContainer>
        you earned <StyledPointsIcon src={pointsIcon} /> {total}{' '}
        <FormattedPlural value={total} one="point" other="points" />
        <StyledDomainsPoints>
          {Object.keys(points).map(domain => (
            <span key={domain}>
              {points[domain]}@{domain.toLowerCase()}{' '}
            </span>
          ))}
        </StyledDomainsPoints>
      </StyledContainer>
    );
  }
}

const mapStateToProps = state => ({
  points: getTipsByDomain(state),
});

export default connect(mapStateToProps)(Earnings);
