import React from 'react';
import CustomChart from '../../../Components/CustomChart';
import data from '../configs/data.json';
import { yAxisGroups } from '../configs/commonConsts';

class SitewiseReport extends React.Component {
	state = {
		series: []
	};

	componentDidMount() {
		let { displayData } = this.props;
		this.computeGraphData(displayData.result);
	}

	computeGraphData = results => {
		const series = [
			{
				name: 'Revenue',
				colorByPoint: true,
				data: []
			}
		];
		const seriesData = [];
		results.forEach(result => {
			seriesData.push({
				name: result.network,
				y: Math.round(result.revenue * 100) / 100
			});
		});
		series[0].data = seriesData;
		this.setState({ series });
	};

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

export default SitewiseReport;
