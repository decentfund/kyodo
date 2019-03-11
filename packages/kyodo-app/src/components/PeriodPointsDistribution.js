import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Earnings from './Earnings';
import { Header } from './Page';
import { loadPeriodTasks } from '../actions';
import {
  getUserTips,
  getCurrentUserAlias,
  getTotalUserTips,
} from '../reducers';

const StyledTableHeader = styled.div`
  display: flex;
  font-family: Roboto Mono;
  font-style: normal;
  line-height: normal;
  font-size: 16px;
  width: 100%;
  margin-bottom: 15px;
`;

const StyledTaskTitle = styled.div`
  margin-right: 20px;
  flex-grow: 1;
  width: 230px;
`;

const StyledTaskId = styled.div`
  width: 40px;
  margin-right: 20px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledAssignee = styled.div`
  margin-right: 20px;
  width: 130px;
`;

const StyledDomainCode = styled.div`
  margin-right: 20px;
  width: 48px;
`;

const StyledSent = styled.div`
  text-align: right;
  width: 55px;
  margin-right: 10px;
`;

const StyledDirection = styled.div`
  width: 40px;
  color: rgba(0, 0, 0, 0.2);
  text-align: right;
  margin-right: 10px;
`;

const StyledReceived = styled.div`
  width: 90px;
`;

const StyledTip = styled.div`
  display: flex;
  font-family: Roboto Mono;
  font-style: normal;
  font-weight: normal;
  line-height: normal;
  font-size: 16px;
  margin-bottom: 15px;
  border-bottom: 0.25px solid #000000;
`;

const StyledTotal = styled.div`
  display: flex;
  font-family: Roboto Mono;
  font-style: normal;
  font-weight: bold;
  line-height: 22px;
  font-size: 16px;
`;

const StyledTotalPaid = styled.div`
  flex-grow: 1;
  text-align: right;
`;

const StyledTotalReceived = styled.div`
  width: 232px;
  margin-left: 38px;
`;

class Members extends Component {
  componentDidMount() {
    this.props.loadPeriodTasks();
  }

  render() {
    const { userAlias, tips, total } = this.props;
    return (
      <div>
        <Header>Token allocation</Header>
        <Earnings />
        <StyledTableHeader>
          <StyledTaskTitle>task</StyledTaskTitle>
          <StyledTaskId>id</StyledTaskId>
          <StyledDomainCode>domain</StyledDomainCode>
          <StyledSent>payed</StyledSent>
          <StyledDirection />
          <StyledAssignee>assignee</StyledAssignee>
          <StyledReceived>received</StyledReceived>
        </StyledTableHeader>
        {tips.map(tip => (
          <StyledTip key={tip.id}>
            <StyledTaskTitle>{tip.title}</StyledTaskTitle>
            <StyledTaskId>{tip.id}</StyledTaskId>
            <StyledDomainCode>{tip.domain}</StyledDomainCode>
            <StyledSent>{tip.from === userAlias ? tip.amount : ''}</StyledSent>
            <StyledDirection>
              {tip.from === userAlias ? 'to' : 'from'}
            </StyledDirection>
            <StyledAssignee>
              {tip.from === userAlias ? tip.to : tip.from}
            </StyledAssignee>
            <StyledReceived>
              {tip.to === userAlias ? tip.amount : ''}
            </StyledReceived>
          </StyledTip>
        ))}
        <StyledTotal>
          <StyledTotalPaid>total payed {total.byUser}</StyledTotalPaid>
          <StyledTotalReceived>
            total received {total.toUser}
          </StyledTotalReceived>
        </StyledTotal>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  userAlias: getCurrentUserAlias(state),
  tips: getUserTips(state),
  total: getTotalUserTips(state),
});

export default connect(
  mapStateToProps,
  { loadPeriodTasks },
)(Members);
