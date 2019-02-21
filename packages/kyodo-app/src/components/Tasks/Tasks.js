import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Header } from '../Page';
import { Header as TableHeader } from '../Table';
import Task from './Task';
import { getTasks } from '../../actions';

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

class Tasks extends PureComponent {
  render() {
    const { count, items = [], domains = [] } = this.props;
    const getDomainName = id => {
      const soughtDomain = domains.find(d => d.potId === id);
      if (soughtDomain) return soughtDomain.name;
      return null;
    };

    // TODO: Can apply
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
          {Object.keys(items).map(id => (
            <Task domain={getDomainName(items[id].domainId)} {...items[id]} />
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
