import React from "react";
import styled from "styled-components";
import propTypes from "prop-types";
import Tip from "./Tip";

const TipListWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
const TipList = ({ ...props }) => (
  <TipListWrapper>
    <Tip
      from="from"
      to="to"
      task="task"
      domain="domain"
      date="when"
      amout="amount"
      style={{ fontWeight: "300" }}
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
          amout={el.amount}
        />
      ))}
  </TipListWrapper>
);

TipList.defaultProps = {
  tips: [
    {
      from: "Nikita",
      to: "Igor",
      task: "For all the works in the early mornings",
      taskId: 1,
      domain: "DEV",
      date: "2018-09-23",
      amount: "6569"
    }
  ]
};

TipList.propTypes = {
  tips: propTypes.array
};

export default TipList;
