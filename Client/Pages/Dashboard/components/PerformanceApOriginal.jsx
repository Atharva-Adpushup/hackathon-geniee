import React from 'react';
import moment from 'moment';
import CustomChart from '../../../Components/CustomChart';
import { yAxisGroups } from '../configs/commonConsts';

class PerformanceApOriginal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			series: [],
			xAxis: {}
		};
	}

	componentDidMount() {
		const { displayData } = this.props;
		if (displayData && displayData.result) {
			this.computeGraphData(displayData.result);
		}
	}

	computeGraphData = results => {
		let series = [];
		const adpushupSeriesData = [];
		const baselineSeriesData = [];
		const xAxis = { categories: [] };
		if (results.length > 0) {
			results.sort((a, b) => {
				const dateA = a.report_date;
				const dateB = b.report_date;
				if (dateA < dateB) {
					return -1;
				}
				if (dateA > dateB) {
					return 1;
				}
				return 0;
			});
			results.forEach(result => {
				adpushupSeriesData.push(result.adpushup_variation_page_cpm);
				baselineSeriesData.push(result.original_variation_page_cpm);
				xAxis.categories.push(moment(result.report_date).format('ll'));
			});
			series = [
				{
					data: adpushupSeriesData,
					name: 'AdPushup Variation Page RPM',
					value: 'adpushup_variation_page_cpm',
					valueType: 'money'
				},
				{
					data: baselineSeriesData,
					name: 'Original Variation Page RPM',
					value: 'original_variation_page_cpm',
					valueType: 'money'
				}
			];
		}
		this.setState({
			series,
			xAxis
		});
	};

	renderChart() {
		const type = 'spline';
		const { series, xAxis } = this.state;
		const { isDataSufficient } = this.props;
		if (series && series.length > 0 && isDataSufficient) {
			return (
				<div>
					<CustomChart type={type} series={series} xAxis={xAxis} yAxisGroups={yAxisGroups} />
				</div>
			);
		}
		return <div className="text-center">Insufficient Data.</div>;
	}

	render() {
		return this.renderChart();
	}
}

export default PerformanceApOriginal;
