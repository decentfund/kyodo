import React, { Component } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { drizzleConnect } from 'drizzle-react';
import BillboardChart from 'react-billboardjs';
import './chart_theme.css';
import { loadHistoricalRates } from '../actions';
import { formatEur, formatEth } from '../helpers/format';
import {
  getHistorical,
  getHistoricalTokenPrice,
  getTotalSupply,
  getContract,
} from '../reducers';

const StyledChartHolder = styled.div`
  width: 482px;
`;

const CHART_CAP = {
  DATA: {
    x: 'x',
    columns: [],
    type: 'area',
  },
  AXES: {
    x: {
      type: 'timeseries',
      tick: {
        count: 4,
        format: '%Y-%m-%d',
      },
    },
    y: {
      show: false,
      tick: {
        format: function(x) {
          return formatEur(x);
        },
      },
    },
  },
  SIZE: {
    height: 240,
  },
  POINT: {
    r: 0,
    focus: {
      expand: {
        r: 2,
      },
    },
  },
  TOOLTIP: {
    format: {
      title: x => moment(x).format('D MMM'),
      name: () => '',
    },
    contents: (data, defaultTitleFormat, defaultValueFormat, color) => {
      console.log(data);
      return `<div><div class="tooltip_date">${moment(data[0].x).format(
        'D MMM',
      )}</div><div>${formatEur(data[0].value)}</div><div>${formatEth(
        data[1].value,
      )}</div></div>`;
    },
    linked: true,
  },
};

const CHART_TOKEN = {
  DATA: {
    x: 'x',
    columns: [],
    type: 'area',
  },
  SIZE: {
    height: 150,
  },
  AXES: {
    x: {
      show: false,
    },
    y: {
      show: false,
      tick: {
        format: function(x) {
          return formatEur(x);
        },
      },
    },
  },
  TOOLTIP: {
    contents: (data, defaultTitleFormat, defaultValueFormat, color) => {
      return `<div>${formatEth(data[0].value)}</div>`;
    },
    linked: true,
  },
};

class Charts extends Component {
  componentDidMount() {
    this.props.loadHistoricalRates([
      'ETH',
      ...Object.keys(process.env.BALANCE),
    ]);
  }

  componentWillReceiveProps(props) {
    this.capChartInstance.loadData({
      columns: [
        ['x', ...props.historical.map(d => moment(d.date).toDate())],
        ['EUR', ...props.historical.map(d => d.balanceEUR)],
        ['ETH', ...props.historical.map(d => d.balanceETH)],
      ],
      axes: {
        EUR: 'y',
        ETH: 'y2',
      },
      hide: true,
    });
    this.tokenChartInstance.loadData({
      columns: [
        ['x', ...props.historical.map(d => moment(d.date).toDate())],
        [
          'tokenPrice',
          ...props.historical.map(d => d.balanceETH / props.totalSupply),
        ],
      ],
    });
  }

  render() {
    return (
      <StyledChartHolder>
        <BillboardChart
          data={CHART_CAP.DATA}
          point={CHART_CAP.POINT}
          ref={c => (this.capChartInstance = c)}
          axis={CHART_CAP.AXES}
          legend={{ show: false }}
          tooltip={CHART_CAP.TOOLTIP}
          size={CHART_CAP.SIZE}
        />
        <BillboardChart
          className="token-chart"
          data={CHART_TOKEN.DATA}
          point={CHART_CAP.POINT}
          ref={c => (this.tokenChartInstance = c)}
          axis={CHART_TOKEN.AXES}
          legend={{ show: false }}
          tooltip={CHART_TOKEN.TOOLTIP}
          size={CHART_TOKEN.SIZE}
        />
      </StyledChartHolder>
    );
  }
}

const mapStateToProps = state => {
  return {
    historical: getHistorical(state),
    tokenPriceHistorical: getHistoricalTokenPrice(state),
    totalSupply: getTotalSupply(getContract('Token')(state)),
  };
};

export default drizzleConnect(Charts, mapStateToProps, {
  loadHistoricalRates,
});
