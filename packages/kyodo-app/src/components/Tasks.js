import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Header } from './Page';
import { Header as TableHeader } from './Table';
import { getTasks } from '../actions';

const StyledTaskTitle = styled.div`
  margin-right: 20px;
  flex-grow: 1;
  width: 157px;
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

const StyledTask = styled.div`
  display: flex;
  font-family: Roboto Mono;
  font-style: normal;
  font-weight: normal;
  line-height: normal;
  font-size: 16px;
  margin-bottom: 15px;
`;

class Tasks extends PureComponent {
  render() {
    const { count, items = [], domains = [] } = this.props;
    const getDomainName = id => {
      const soughtDomain = domains.find(d => d.potId === id);
      if (soughtDomain) return soughtDomain.name;
      return null;
    };
    return (
      <div>
        <Header>Tasks</Header>
        <div>
          <TableHeader>
            <StyledTaskTitle>task</StyledTaskTitle>
            <StyledAssignee>assignee</StyledAssignee>
            <StyledDomainCode>domain</StyledDomainCode>
            <StyledTips>amount</StyledTips>
          </TableHeader>
          {items.map(item => (
            <StyledTask key={item.id}>
              <StyledTaskTitle>
                {item.title}
                <br />
                {item.description}
              </StyledTaskTitle>
              <StyledAssignee>-</StyledAssignee>
              <StyledDomainCode>
                {getDomainName(item.domainId)}
              </StyledDomainCode>
              <StyledTips>{item.amount}</StyledTips>
            </StyledTask>
          ))}
        </div>
        <div>Task count: {count}</div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  count: state.tasks.count,
  items: state.tasks.items,
  domains: state.colony.domains,
});

export default connect(
  mapStateToProps,
  { getTasks },
)(Tasks);
