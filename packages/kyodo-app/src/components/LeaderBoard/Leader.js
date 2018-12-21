import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Blockies from 'react-blockies';
import { formatCurrency } from '../../helpers/format';

const Container = styled.div`
  display: flex;
  font-size: 16px;
  line-height: 24px;
  width: 100%;
`;

const NamePointsContainer = styled.div`
  flex-grow: 1;
  display: flex;
  overflow: hidden;
`;

const NameContainer = styled.div`
  height: 24px;
  flex-grow: 1;
  display: flex;
  margin-bottom: 24px;
  overflow: hidden;
`;

const Name = styled.div`
  padding: 0 0 0 6px;
  position: relative;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  &:before {
    background: ${({ leader }) =>
      !leader ? 'rgba(0, 0, 0, 0.06)' : '#F5F905'};
    border-radius: 0px 12px 12px 0px;
    content: '';
    position: absolute;
    left: 0px;
    width: ${({ width }) => `${width * 100}%`};
    height: 100%;
    z-index: -1;
  }
`;

const PointsContainer = styled.div`
  font-weight: ${({ leader }) => (leader ? '800' : '400')};
  text-align: right;
  padding-right: 17px;
  padding-left: 8px;
`;

const DomainPointsContainer = styled.div`
  text-align: right;
  min-width: 75px;

  span {
    padding: 0px 3px;
    background: ${({ leader }) => (leader ? '#F5F905' : null)};
    font-weight: ${({ leader, active }) => (leader || active ? 800 : null)};
  }
`;

const Earnings = styled.div`
  background: rgba(0, 0, 0, 0.06);
  display: flex;
`;

const Earning = styled.div`
  width: 45px;
  text-align: center;
  font-size: 12px;
`;

class Leader extends Component {
  render() {
    const {
      width,
      name,
      address,
      leader,
      earnings,
      domains,
      pointPrice,
      tokenPriceEUR,
      tokenPriceETH,
      domainStats,
      sorting,
    } = this.props;
    const { total } = earnings;
    const earnedDFTokens = domains.reduce(
      (memo, domain) => memo + (earnings[domain] || 0) * pointPrice[domain],
      0,
    );
    return (
      <Container>
        <NamePointsContainer>
          <NameContainer>
            <Blockies
              seed={address}
              size={8}
              scale={3}
              color="#BD6FD8"
              spotColor="#EEEEEE"
              bgColor="#F5F905"
            />
            <Name width={width} leader={leader}>
              {name || `member known as .${address.slice(-4)}`}
            </Name>
          </NameContainer>
          <PointsContainer leader={leader}>{total}</PointsContainer>
        </NamePointsContainer>
        <Earnings>
          <Earning>{formatCurrency(earnedDFTokens, 'DF', 0)}</Earning>
          <Earning>
            {formatCurrency(earnedDFTokens * tokenPriceETH, 'ETH', 2)}
          </Earning>
          <Earning>
            {formatCurrency(earnedDFTokens * tokenPriceEUR, 'EUR')}
          </Earning>
        </Earnings>
        {domains.map(domain => (
          <DomainPointsContainer
            key={domain}
            leader={
              domainStats.filter(d => d.domain === domain && d.user === name)
                .length > 0
            }
            active={sorting === domain}
          >
            <span>{earnings[domain] || '0'}</span>
          </DomainPointsContainer>
        ))}
      </Container>
    );
  }
}

Leader.propTypes = {
  name: PropTypes.string,
  address: PropTypes.string,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  width: PropTypes.number,
  earnings: PropTypes.object,
  tokenPriceEUR: PropTypes.number,
  tokenPriceETH: PropTypes.number,
  domainStats: PropTypes.object,
};

Leader.defaultProps = {
  earnings: {},
};

export default Leader;
