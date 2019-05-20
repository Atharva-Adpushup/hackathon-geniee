import React from 'react';

import { groupBy, sortBy, find } from 'lodash';
import moment from 'moment';
import CustomChart from '../../../Components/CustomChart';
import apLineChartConfig from '../configs/line-ap-data.json';

class Chart extends React.Component {
	state = {
		type: 'spline',
		xAxis: { categories: [] },
		startDate: this.props.startDate,
		endDate: this.props.endDate,
		selectedDimension: this.props.selectedDimension,
		legends: [
			{ value: 'network_net_revenue', name: 'Revenue' },
			{ value: 'network_impressions', name: 'Impressions' },
			{ value: 'network_ad_ecpm', name: 'CPM' }
		],
		activeLegendItems: { value: 'network_net_revenue', name: 'Revenue' },
		series: [],
		tableData: this.props.tableData
	};

	enumerateDaysBetweenDates = () => {
		const { startDate, endDate, xAxis } = this.state;
		const dates = [];

		const currDate = moment(startDate).startOf('day');
		const lastDate = moment(endDate).startOf('day');

		while (currDate.diff(lastDate) <= 0) {
			console.log(currDate.toDate());
			dates.push(currDate.clone().format('YYYY-MM-DD'));
			currDate.add(1, 'days');
		}

		xAxis.categories = dates;
		this.setState(xAxis);
	};

	componentDidUpdate(prevProps) {
		if (prevProps.tableData !== this.props.tableData) {
			this.setState({
				tableData: this.props.tableData
			});
			const { activeLegendItems } = this.state;
			this.enumerateDaysBetweenDates();
			this.updateChartData(activeLegendItems);
		}
	}

	componentDidMount() {
		const { activeLegendItems } = this.state;
		this.enumerateDaysBetweenDates();
		this.updateChartData(activeLegendItems);
	}

	updateChartData = activeLegendItems => {
		this.enumerateDaysBetweenDates();
		const { selectedDimension } = this.props;
		const { xAxis, tableData } = this.state;
		const series = [];
		if (tableData.result && tableData.result.length > 0) {
			const rows = tableData.result;
			const groupByResult = groupBy(rows, row => row[selectedDimension]);

			for (const results in groupByResult) {
				const serie = { data: [], name: results, visible: true };
				groupByResult[results] = sortBy(groupByResult[results], result => result.date);
				for (let i = 0; i < xAxis.categories.length; i++) {
					const found = find(groupByResult[results], result => result.date === xAxis.categories[i]);
					if (found) serie.data.push(found[activeLegendItems.value]);
					else serie.data.push(0);
				}
				series.push(serie);
			}
			this.setState({ series, activeLegendItems });
		}
	};

	render() {
		const { type, series, xAxis, legends, activeLegendItems } = this.state;
		return (
			<div>
				<CustomChart
					type={type}
					series={series}
					xAxis={xAxis}
					legends={legends}
					activeLegendItems={activeLegendItems}
					updateChartData={this.updateChartData}
				/>
			</div>
		);
	}
}

export default Chart;
