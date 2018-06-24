import React from 'react';
import styled from 'styled-components';
import propTypes from 'prop-types';
import Tip from './Tip';

const TipListWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const TipList = props => (
  <TipListWrapper>
    <Tip
      from="from"
      to="to"
      task="task"
      domain="domain"
      date="when"
      amount="amount"
      style={{ fontWeight: '300' }}
    />
    {props.tips &&
      props.tips.map(el => (
        <Tip
          key={el.taskId}
          from={el.from}
          to={el.to}
          task={el.task}
          domain={el.domain}
          date={el.date}
          amount={el.amount}
        />
      ))}
  </TipListWrapper>
);

TipList.defaultProps = {
  tips: null,
};

TipList.propTypes = {
  tips: propTypes.array,
};

export default TipList;
