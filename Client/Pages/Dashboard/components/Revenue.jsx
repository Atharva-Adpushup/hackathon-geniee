import React from 'react';
import CustomChart from '../../../Components/CustomChart';
import data from '../configs/data.json';
import { yAxisGroups } from '../configs/commonConsts';
import { roundOffTwoDecimal, getWidgetValidDationState } from '../helpers/utils';

function computeDisplayData(props) {
	const {
		displayData: {
			data: { result: resultData },
			chartLegend,
			chartSeriesLabel,
			chartSeriesMetric,
			chartSeriesMetricType
		}
	} = props;
	const series = [
		{
			name: chartLegend,
			colorByPoint: true,
			data: []
		}
	];
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

	series[0].data = seriesData.sort((a, b) => a.y - b.y);
	return series;
}

const DEFAULT_STATE = {
	series: []
};

class Revenue extends React.Component {
	state = DEFAULT_STATE;

	static getDerivedStateFromProps(props) {
		const { displayData } = props;
		const { isValid, isValidAndEmpty } = getWidgetValidDationState(displayData);

		if (!isValid) {
			return null;
		}

		if (isValidAndEmpty) {
			return DEFAULT_STATE;
		}

		const seriesData = computeDisplayData(props);
		return { series: seriesData };
	}

	renderChart() {
		const type = 'pie';
		const { series } = this.state;

		if (series && series.length && series[0].data && series[0].data.length)
			return (
				<div>
					<CustomChart type={type} xAxis={data.xAxis} series={series} yAxisGroups={yAxisGroups} />
				</div>
			);

		return <div className="text-center">No Record Found.</div>;
	}

	render() {
		return this.renderChart();
	}
}

export default Revenue;
