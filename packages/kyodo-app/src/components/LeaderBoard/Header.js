import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Arrow from './Arrow';
import df from './df.svg';
import eth from './eth.svg';
import eur from './eur.svg';

const Container = styled.div`
  display: flex;
  font-size: 16px;
  text-transform: uppercase;
  text-align: right;
`;

const DomainTitle = styled.div`
  width: 75px;
`;

const Token = styled.div`
  width: 45px;
  text-align: center;
  background: rgba(0, 0, 0, 0.06);
  padding-bottom: 30px;
`;

const PointsEarned = styled.div`
  flex-grow: 1;
  text-align: right;
  padding-right: 17px;
`;

const Header = ({ domains, sorting = 'total', onSortingChange }) => (
  <Container>
    <PointsEarned>
      Points earned
      <Arrow
        active={sorting === 'total' ? true : null}
        onClick={onSortingChange.bind(this, 'total')}
      />
    </PointsEarned>
    <Token>
      <img src={df} alt="df" />
    </Token>
    <Token>
      <img src={eth} alt="eth" />
    </Token>
    <Token>
      <img src={eur} alt="eur" />
    </Token>
    {domains.map(domain => (
      <DomainTitle>
        {domain.name}
        <Arrow
          active={sorting === domain.name}
          onClick={onSortingChange.bind(this, domain.name)}
        />
      </DomainTitle>
    ))}
  </Container>
);

Header.propTypes = {
  domains: PropTypes.array,
  sorting: PropTypes.string,
  onSortingChange: PropTypes.func,
};

export default Header;
