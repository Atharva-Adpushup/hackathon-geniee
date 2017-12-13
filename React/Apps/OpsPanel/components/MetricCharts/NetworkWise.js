import React, { Component } from 'react';
import { Panel, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import _ from 'lodash';
import extend from 'extend';
import ReactHighCharts from 'react-highcharts';
import PaneLoader from '../../../../Components/PaneLoader.jsx';
import { LINE_CHART_CONFIG } from '../../configs/commonConsts';
import SelectBox from '../../../../Components/SelectBox/index.jsx';

function generateHighChartConfig(inputData, metricName) {
	const chartConfig = extend(true, {}, LINE_CHART_CONFIG),
		categories = [],
		contributionData = extend(true, {}, inputData.dayWise);
	const capitalisedMetric = metricName.toUpperCase();

	chartConfig.yAxis.title.text = `${capitalisedMetric} ($)`;
	chartConfig.title.text = `${capitalisedMetric} Performance`;

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
			selectedMetric: 'cpm',
			startDate: moment()
				.subtract(7, 'days')
				.startOf('day'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day')
		};
		this.renderHighCharts = this.renderHighCharts.bind(this);
		this.generateHeaderTitle = this.generateHeaderTitle.bind(this);
		this.handleSelectBoxChange = this.handleSelectBoxChange.bind(this);
		this.renderSelectBox = this.renderSelectBox.bind(this);
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
			metricName = this.state.selectedMetric,
			config = generateHighChartConfig(inputData, metricName);

		return <ReactHighCharts config={config} />;
	}

	handleSelectBoxChange(metric = 'cpm') {
		metric = metric ? metric : 'cpm';
		this.setState({
			selectedMetric: metric
		});
	}

	renderSelectBox() {
		return (
			<SelectBox
				value={this.state.selectedMetric}
				label="Select metric"
				onChange={this.handleSelectBoxChange}
				onClear={this.handleSelectBoxChange}
				disabled={false}
			>
				<option key="0" value="cpm">
					CPM
				</option>
				<option key="1" value="revenue">
					REVENUE
				</option>
				<option key="2" value="impressions">
					IMPRESSIONS
				</option>
			</SelectBox>
		);
	}

	generateHeaderTitle() {
		return (
			<Row className="u-block u-margin-0px">
				<Col className="u-full-height aligner aligner--hStart aligner--vCenter" xs={8}>
					<h4>Network Wise Chart</h4>
				</Col>
				<Col className="u-full-height aligner aligner--hCenter aligner--vBottom" xs={4}>
					{this.renderSelectBox()}
				</Col>
			</Row>
		);
	}

	render() {
		const props = this.props,
			headerTitle = this.generateHeaderTitle();

		return (
			<Panel className="mb-20 metricsChart" header={headerTitle}>
				{this.state.isDataLoaded ? this.renderHighCharts() : <PaneLoader />}
			</Panel>
		);
	}
}

export default NetworkWise;
