import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import styled from 'styled-components';
import {
  getContract,
  getCurrentPeriodInfo,
  getPointsDistribution,
} from '../reducers';
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
        {title} {used > 0 && used} {unused && used && '/'}{' '}
        {unused > 0 && unused}
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
  state = {
    domainsLengthKey: null,
    domainsLength: null,
    domains: [],
    domainsKeys: [],
  };

  constructor(props, context) {
    super(props, context);
    this.contracts = context.drizzle.contracts;
  }

  componentDidMount() {
    this.props.loadPeriodTasks();
    const domainsLengthKey = this.contracts.Domains.methods.getDomainsLength.cacheCall();
    this.setState({ domainsLengthKey });
  }

  componentDidUpdate() {
    const { Domains } = this.props;
    const {
      domainsLengthKey,
      domainsLength,
      domains,
      domainsKeys,
    } = this.state;

    if (
      domainsLength === null &&
      domainsLengthKey &&
      Domains &&
      Domains.getDomainsLength[domainsLengthKey]
    ) {
      const domainsLength = Number(
        Domains.getDomainsLength[domainsLengthKey].value,
      );
      const domainsKeysData = [];
      for (let i = 0; i < domainsLength; ++i) {
        domainsKeysData.push(
          this.contracts.Domains.methods.getDomain.cacheCall(i),
        );
      }
      this.setState({ domainsLength, domainsKeys: domainsKeysData });
    }

    if (
      domainsLength &&
      !domains.length &&
      Domains.getDomain &&
      Object.keys(Domains.getDomain).length === domainsLength
    ) {
      const domainsData = [];
      for (let i = 0; i < domainsLength; ++i) {
        domainsData.push(Domains.getDomain[domainsKeys[i]].value);
      }
      this.setState({ domains: domainsData });
    }
  }

  render() {
    const {
      currentPeriod: { initialBalance, periodTitle },
      pointsDistribution,
    } = this.props;
    const { total: usedTips } = pointsDistribution;
    const { domains } = this.state;
    const fraction = initialBalance > 0 ? usedTips / initialBalance : 0;
    const inPercent = parseFloat(fraction * 100).toFixed(2);
    const total = Number(initialBalance);

    const domainsData = domains
      .filter(domain => pointsDistribution[domain[0]] !== undefined)
      .map(domain => {
        const domainName = domain[0];
        const used = pointsDistribution[domainName] || 0;
        // const unused = total - used;
        // Without liquidity democracy unused is olways 0
        const unused = 0;
        return {
          title: domainName,
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
        {!!total &&
          !!domainsData.length && (
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

PeriodDistributionSummary.contextTypes = {
  drizzle: PropTypes.object,
};

const mapStateToProps = state => ({
  currentPeriod: getCurrentPeriodInfo(state),
  Domains: getContract('Domains')(state),
  pointsDistribution: getPointsDistribution(state),
});

export default drizzleConnect(PeriodDistributionSummary, mapStateToProps, {
  loadPeriodTasks,
});
