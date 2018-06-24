import React from 'react';
import styled from 'styled-components';
import propTypes from 'prop-types';
import moment from 'moment';

//TODO: proper responsive, crop content if too long helper

const TipWrapper = styled.div`
  .short {
    min-width: 8%;
  }
  .long {
    min-width: 46%;
  }
  .date {
    min-width: 120px;
  }
  margin: 2.5px 15px 0 15px;
  display: flex;
  flex-direction: row;
  font-weight: ${props => (props.style ? 'thin' : 'bold')};
  @media only screen and (max-width: 960px) {
    font-size: 0.8rem;
  }
`;

const Tip = props => (
  <TipWrapper style={props.style}>
    <p className="short ">{props.from}</p>
    <p className="short">--></p>
    <p className="short ">{props.to}</p>
    <p className="long">{props.task}</p>
    <p className="short ">{props.domain}</p>
    <p className="date">
      {props.date === 'when' ? props.date : moment(props.date).from()}
    </p>
    <p className="short ">{props.amount} DC</p>
  </TipWrapper>
);

Tip.defaultProps = {
  date: moment(),
};

Tip.propTypes = {
  amount: propTypes.number.isRequired,
  from: propTypes.string.isRequired,
  to: propTypes.string.isRequired,
  date: propTypes.string,
  task: propTypes.string.isRequired,
};

export default Tip;
