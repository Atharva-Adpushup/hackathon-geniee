import React from 'react';
import moment from 'moment';
import CustomChart from '../../../Components/CustomChart';
import { yAxisGroupsVideoRevenuePrimis } from '../configs/commonConsts';
import { getWidgetValidDationState } from '../helpers/utils';

function computeGraphData(results) {
	let series = [];
	const adpushupVideoRevenueSeriesData = [];
	const xAxis = { categories: [] };

	if (results.length) {
		results.sort((a, b) => {
			const dateA = a.date;
			const dateB = b.date;
			if (dateA < dateB) {
				return -1;
			}
			if (dateA > dateB) {
				return 1;
			}
			return 0;
		});

		results.forEach(result => {
			adpushupVideoRevenueSeriesData.push(result.net_revenue);
			xAxis.categories.push(moment(result.date).format('ll'));
		});

		series = [
			{
				data: adpushupVideoRevenueSeriesData,
				name: 'Video Revenue',
				value: 'network_revenue',
				valueType: 'money'
			}
		];
	}

	const computedState = {
		series,
		xAxis
	};
	return computedState;
}

const DEFAULT_STATE = {
	series: [],
	xAxis: {}
};

class VideoAdRevenue extends React.Component {
	constructor(props) {
		super(props);
		this.state = DEFAULT_STATE;
	}

	static getDerivedStateFromProps(props) {
		const { displayData } = props;
		const { isValid, isValidAndEmpty } = getWidgetValidDationState(displayData);

		const { total = {} } = displayData;
		if (!isValid) {
			return null;
		}

		if (isValidAndEmpty) {
			return DEFAULT_STATE;
		}

		const computedState = computeGraphData(displayData.result);
		return { ...computedState, totalNetworkRevenue: total.network_revenue || '' };
	}

	renderChart() {
		const type = 'spline';
		const { series, xAxis, totalNetworkRevenue } = this.state;

		if (series && series.length > 0) {
			return (
				<div>
					{totalNetworkRevenue && (
						<div>
							Cumulative Revenue: <span>${totalNetworkRevenue}</span>
						</div>
					)}
					<CustomChart
						type={type}
						series={series}
						xAxis={xAxis}
						yAxisGroups={yAxisGroupsVideoRevenuePrimis}
					/>
				</div>
			);
		}
		return <div className="text-center">Insufficient Data. Adpushup Optimization is Underway.</div>;
	}

	render() {
		return this.renderChart();
	}
}

export default VideoAdRevenue;
