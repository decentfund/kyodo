import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Header } from './Table';

const StyledTaskTitle = styled.div`
  margin-right: 20px;
  flex-grow: 1;
  width: 157px;
`;

const StyledTaskId = styled.div`
  width: 40px;
  margin-right: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledAssignee = styled.div`
  margin-right: 20px;
  width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledDomainCode = styled.div`
  margin-right: 20px;
  width: 75px;
`;

const StyledTips = styled.div`
  width: 40px;
  text-align: right;
`;

const StyledTip = styled.div`
  display: flex;
  font-family: Roboto Mono;
  font-style: normal;
  font-weight: normal;
  line-height: normal;
  font-size: 16px;
  margin-bottom: 15px;
`;

class TasksList extends Component {
  render() {
    return (
      <div>
        <Header>
          <StyledTaskTitle>task</StyledTaskTitle>
          <StyledTaskId>id</StyledTaskId>
          <StyledAssignee>assignee</StyledAssignee>
          <StyledDomainCode>domain</StyledDomainCode>
          <StyledTips>tips</StyledTips>
        </Header>
        {this.props.tips.map(tip => (
          <StyledTip key={tip.id}>
            <StyledTaskTitle>{tip.title}</StyledTaskTitle>
            <StyledTaskId>{tip.id}</StyledTaskId>
            <StyledAssignee>{tip.to}</StyledAssignee>
            <StyledDomainCode>{tip.domain}</StyledDomainCode>
            <StyledTips>{tip.amount}</StyledTips>
          </StyledTip>
        ))}
      </div>
    );
  }
}

TasksList.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = state => ({
  userAddress: state.accounts[0],
  tips: state.tips,
});

export default connect(mapStateToProps)(TasksList);
