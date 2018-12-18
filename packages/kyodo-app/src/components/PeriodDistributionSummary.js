import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import { getCurrentPeriodInfo, getPointsDistribution } from '../reducers';
import { loadPeriodTasks } from '../actions';

const PageWrapper = styled.div``;

const Summary = styled.div`
  font-size: 24px;
`;

const ProgressBarWrapper = styled.div`
  border: 1px solid #000000;
  box-sizing: border-box;
  border-radius: 20px;
  height: 5px;
  background: white;
  overflow: hidden;
  width: 170px;
`;

const ProgressBar = styled.div`
  width: ${props => props.fraction * 100}%;
  border-right: 1px solid #000000;
  background: #bd6fd8;
  height: 5px;
`;

const Percent = styled.div`
  font-size: 11px;
  margin-top: 4px;
`;

const DomainsDistributionWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const DomainDistributionWrapper = styled.div`
  margin-top: 50px;
  margin-right: 100px;
`;

const DomainTitle = styled.div`
  font-size: 18px;
  margin-bottom: 20px;
`;

const DomainDistributionGrid = styled.div`
  width: ${props => props.elementsPerRow * 11}px;
  display: flex;
  flex-wrap: wrap;
`;

const UsedBlock = styled.div`
  width: 10px;
  height: 10px;
  margin-right: 1px;
  margin-bottom: 1px;
  background-color: #bd6fd8;
`;

const UnusedBlock = styled.div`
  width: 10px;
  height: 10px;
  margin-right: 1px;
  margin-bottom: 1px;
  background-color: #f0f0f0;
`;

// TODO: move to separate component (?)
const DomainDistribution = ({ title, used, unused }) => {
  const pointsPerBlock = 5;
  const usedBlocks = Math.round(used / pointsPerBlock);
  const unusedBlocks = Math.round(unused / pointsPerBlock);
  const totalBlocks = usedBlocks + unusedBlocks;
  const elementsPerRow = Math.ceil(Math.sqrt(totalBlocks));

  return (
    <DomainDistributionWrapper>
      <DomainTitle>
        {title} {used > 0 ? used : null} {unused && used ? '/' : null}{' '}
        {unused > 0 ? unused : null}
      </DomainTitle>
      <DomainDistributionGrid elementsPerRow={elementsPerRow}>
        {usedBlocks > 0 &&
          [...Array(usedBlocks)].map((_, i) => <UsedBlock key={`used${i}`} />)}
        {unusedBlocks > 0 &&
          [...Array(unusedBlocks)].map((_, i) => (
            <UnusedBlock key={`unused${i}`} />
          ))}
      </DomainDistributionGrid>
    </DomainDistributionWrapper>
  );
};

class PeriodDistributionSummary extends Component {
  componentDidMount() {
    this.props.loadPeriodTasks();
  }

  render() {
    const {
      currentPeriod: { initialBalance, periodTitle },
      pointsDistribution,
      domains,
    } = this.props;
    const { total: usedTips } = pointsDistribution;
    const fraction = initialBalance > 0 ? usedTips / initialBalance : 0;
    const inPercent = parseFloat(fraction * 100).toFixed(2);
    const total = Number(initialBalance);

    const domainsData = domains
      .filter(domain => pointsDistribution[domain.name] !== undefined)
      .map(domain => {
        const used = pointsDistribution[domain.name] || 0;
        // const unused = total - used;
        // Without liquidity democracy unused is olways 0
        const unused = 0;
        return {
          title: domain.name,
          used,
          unused,
        };
      });

    const unused = total - usedTips;

    return (
      <PageWrapper>
        <Summary>
          {usedTips} of {initialBalance} points distributed in {periodTitle}
          <ProgressBarWrapper>
            <ProgressBar fraction={fraction} />
          </ProgressBarWrapper>
          <Percent>{inPercent}%</Percent>
        </Summary>
        {!!total && (
          <DomainsDistributionWrapper>
            {domainsData.map(data => (
              <DomainDistribution {...data} key={data.title} />
            ))}
          </DomainsDistributionWrapper>
        )}
        {unused > 0 ? (
          <DomainsDistributionWrapper>
            <DomainDistribution used={0} unused={unused} title="UNUSED" />
          </DomainsDistributionWrapper>
        ) : null}
      </PageWrapper>
    );
  }
}

const mapStateToProps = state => ({
  currentPeriod: getCurrentPeriodInfo(state),
  domains: state.colony.domains,
  pointsDistribution: getPointsDistribution(state),
});

export default drizzleConnect(PeriodDistributionSummary, mapStateToProps, {
  loadPeriodTasks,
});
