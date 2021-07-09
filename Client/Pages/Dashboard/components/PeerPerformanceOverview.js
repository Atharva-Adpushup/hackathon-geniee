import React from 'react';
import sortBy from 'lodash/sortBy';
import data from '../configs/data.json';
import CustomChart from '../../../Components/CustomChart';
import { numberWithCommas, roundOffTwoDecimal } from '../helpers/utils';
import { peerPerformanceDisplayMetrics, yAxisGroups } from '../configs/commonConsts';
import Card from '../../../Components/Layout/Card';

//session rpm /ap page views

function computeDisplayDataForCharts(props) {
	const {
		revenueChannelData,
		chartLegend,
		chartSeriesLabel,
		chartSeriesMetric,
		chartSeriesMetricType
	} = props;
	const { result: resultData } = revenueChannelData;
	const seriesData = [];

	if (resultData) {
		resultData.forEach(result => {
			seriesData.push({
				name: result[chartSeriesLabel],
				y: parseFloat(roundOffTwoDecimal(result[chartSeriesMetric])),
				valueType: chartSeriesMetricType
			});
		});
	}
	const series = [
		{
			name: chartLegend,
			colorByPoint: true,
			data: seriesData.sort((a, b) => a.y - b.y)
		}
	];

	return series;
}

function computeDisplayData(props) {
	const { metrics, peerPerformanceReport } = props;
	const resultData = {};
	const { result: [peerData] = [] } = peerPerformanceReport;
	const computedDisplayMetrics = peerPerformanceDisplayMetrics;
	if (!peerData) return;
	Object.keys(computedDisplayMetrics).forEach(metric => {
		resultData[metric] = {
			name: computedDisplayMetrics[metric].name,
			value: peerData[metric],
			valueType: computedDisplayMetrics[metric].valueType,
			position: metrics[metric].chart_position
		};
	});
	return sortBy(resultData, o => o.position);
}

const DEFAULT_STATE = {
	displayData: {},
	revenueChannelData: {}
};

class PeerPerformanceOverview extends React.Component {
	constructor(props) {
		super(props);
		this.state = DEFAULT_STATE;
	}

	static getDerivedStateFromProps(props) {
		const displayData = computeDisplayData(props);
		const revenueChannelData = computeDisplayDataForCharts(props);
		return { displayData, revenueChannelData };
	}

	renderRevenueChannelChart = () => {
		const type = 'pie';
		const { revenueChannelData: series } = this.state;
		const [seriesData] = series;
		const isRevenueDataExits = series && series.length && seriesData.data && seriesData.data.length;
		return (
			<div>
				<div className="peer-performance-chart-header">Revenue Split across different channels</div>
				{(isRevenueDataExits && (
					<CustomChart type={type} xAxis={data.xAxis} series={series} yAxisGroups={yAxisGroups} />
				)) || <div className="text-center">No Record Found.</div>}
			</div>
		);
	};

	giveFormattedValue = (value, valueType) => {
		if (valueType === 'money') return `$${numberWithCommas(roundOffTwoDecimal(value))}`;
		if (valueType === 'integer') return parseInt(value, 10);
		return numberWithCommas(value);
	};

	render() {
		const { displayData = [] } = this.state;

		const { giveFormattedValue } = this;

		return (
			<div>
				<div className="u-margin-t4 u-margin-b4" style={{}}>
					{displayData.length > 0 ? (
						displayData.map(({ name, value, valueType }) => (
							<div className="col-sm-4 u-margin-b4 text-center" key={name}>
								<div className="font-small">{name}</div>
								<div className="estimatedEarning">
									<span>{giveFormattedValue(value, valueType)}</span>
								</div>
							</div>
						))
					) : (
						<div className="text-center">No Record Found.</div>
					)}
				</div>
				<div>
					<Card
						rootClassName="u-margin-b4 width-100 peer-performance-revenue-chart"
						type="default"
						key="peer-performance-revenue-chart"
						headerClassName="card-header"
						bodyClassName="card-body"
						footerClassName="card-footer"
						bodyChildren={this.renderRevenueChannelChart()}
					/>
				</div>
			</div>
		);
	}
}

export default PeerPerformanceOverview;
