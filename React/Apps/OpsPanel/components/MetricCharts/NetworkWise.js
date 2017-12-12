import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import moment from 'moment';
import _ from 'lodash';
import extend from 'extend';
import ReactHighCharts from 'react-highcharts';
import PaneLoader from '../../../../Components/PaneLoader.jsx';
import { LINE_CHART_CONFIG } from '../../configs/commonConsts';

const FooterTitle = <h4>Network Wise Performance Chart</h4>;

function generateHighChartConfig(inputData, metricName) {
	const chartConfig = extend(true, {}, LINE_CHART_CONFIG),
		categories = [],
		contributionData = extend(true, {}, inputData.dayWise);

	chartConfig.yAxis.title.text = `${metricName.toUpperCase()} ($)`;

	_.forOwn(contributionData, (adNetworkDayWiseReport, adNetworkKey) => {
		const seriesObject = {
				name: adNetworkKey,
				data: []
			},
			// Below condition is added to avoid 'categories' array stuffed with redundant
			// day values.
			isCategoriesValidLength = !!(categories && categories.length + 1 <= 7),
			isChartConfigCategoriesEmptyLength = !!chartConfig.xAxis.categories.length;

		_.forOwn(adNetworkDayWiseReport, (dayWiseObject, dateKey) => {
			if (isCategoriesValidLength) {
				const dayCategory = moment(dateKey).format('MMM DD');
				categories.push(dayCategory);
			}

			seriesObject.data.push(dayWiseObject[metricName]);
		});

		chartConfig.series.push(seriesObject);

		if (isCategoriesValidLength || !isChartConfigCategoriesEmptyLength) {
			chartConfig.xAxis.categories = chartConfig.xAxis.categories.concat(categories);
		}
	});

	return chartConfig;
}

class NetworkWise extends Component {
	constructor(props) {
		super(props);
		let isDataLoaded =
			this.props.data &&
			Object.keys(this.props.data).length &&
			this.props.data.aggregated &&
			this.props.data.dayWise
				? true
				: false;

		this.state = {
			isDataLoaded,
			data: isDataLoaded ? this.props.data : null,
			startDate: moment()
				.subtract(7, 'days')
				.startOf('day'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day')
		};
		this.renderHighCharts = this.renderHighCharts.bind(this);
	}

	componentDidMount() {
		this.state.isDataLoaded
			? null
			: this.props.fetchData({
					transform: true,
					fromDate: this.state.startDate,
					toDate: this.state.endDate
				});
	}

	componentWillReceiveProps(nextProps) {
		let isDataLoaded =
				nextProps.data &&
				Object.keys(nextProps.data).length &&
				nextProps.data.aggregated &&
				nextProps.data.dayWise
					? true
					: false,
			data = isDataLoaded ? Object.assign(nextProps.data) : null;

		this.setState({ isDataLoaded, data });
	}

	renderHighCharts() {
		let inputData = this.state.data,
			metricName = 'cpm',
			config = generateHighChartConfig(inputData, metricName);

		return <ReactHighCharts config={config} />;
	}

	render() {
		const props = this.props;

		return (
			<Panel className="mb-20 metricsChart" header={FooterTitle}>
				{this.state.isDataLoaded ? this.renderHighCharts() : <PaneLoader />}
			</Panel>
		);
	}
}

export default NetworkWise;
