import React, { Component } from 'react';
import { Panel, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import _ from 'lodash';
import extend from 'extend';
import ReactHighCharts from 'react-highcharts';
import PaneLoader from '../../../../Components/PaneLoader.jsx';
import { LINE_CHART_CONFIG } from '../../configs/commonConsts';
import SelectBox from '../../../../Components/SelectBox/index.jsx';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import '../../../ReportingPanel/styles.scss';

function generateHighChartConfig(inputData, metricName) {
	const chartConfig = extend(true, {}, LINE_CHART_CONFIG),
		categories = inputData.dateFormat.collection.concat([]),
		contributionData = extend(true, {}, inputData.dayWise);
	const capitalisedMetric = metricName.toUpperCase();
	const seriesObject = {
		revenue: {
			name: 'Revenue',
			data: []
		},
		impressions: {
			name: 'Impressions',
			data: []
		},
		pageViews: {
			name: 'PageViews',
			data: []
		},
		cpm: {
			name: 'CPM',
			data: []
		}
	};

	chartConfig.yAxis.title.text = `${capitalisedMetric} ($)`;
	chartConfig.title.text = `${capitalisedMetric} Performance`;
	chartConfig.xAxis.categories = chartConfig.xAxis.categories.concat(categories);

	_.forOwn(contributionData, (dayWiseObject, dateKey) => {
		seriesObject[metricName].data.push(dayWiseObject[metricName]);
	});

	const metricSeries = extend(true, {}, seriesObject[metricName]);
	chartConfig.series.push(metricSeries);

	return chartConfig;
}

class Metrics extends Component {
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
			selectedMetric: 'revenue',
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
		this.renderDateRangePickerUI = this.renderDateRangePickerUI.bind(this);
		this.datesUpdated = this.datesUpdated.bind(this);
		this.focusUpdated = this.focusUpdated.bind(this);
		this.fetchReportData = this.fetchReportData.bind(this);
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

	handleSelectBoxChange(metric = 'revenue') {
		metric = metric ? metric : 'revenue';
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
				<option key="3" value="pageViews">
					PAGEVIEWS
				</option>
			</SelectBox>
		);
	}

	datesUpdated({ startDate, endDate }) {
		this.setState({ startDate, endDate });
	}

	focusUpdated(focusedInput) {
		this.setState({ focusedInput });
	}

	renderDateRangePickerUI() {
		return (
			<Col className="u-full-height aligner aligner--hBottom aligner--vCenter" xs={8}>
				<DateRangePicker
					onDatesChange={this.datesUpdated}
					onFocusChange={this.focusUpdated}
					focusedInput={this.state.focusedInput}
					startDate={this.state.startDate}
					endDate={this.state.endDate}
					showDefaultInputIcon={true}
					hideKeyboardShortcutsPanel={true}
					showClearDates={true}
					minimumNights={0}
					displayFormat={'DD-MM-YYYY'}
					isOutsideRange={() => {}}
				/>
				<button
					className="btn btn-lightBg btn-default btn-blue u-margin-l10px"
					onClick={eve => this.fetchReportData()}
				>
					Generate
				</button>
				<button
					className="btn btn-lightBg btn-default u-margin-l10px"
					onClick={this.fetchReportData.bind(null, true)}
				>
					Reset
				</button>
			</Col>
		);
	}

	fetchReportData(reset = false) {
		this.setState({ isDataLoaded: false });
		this.props.fetchData({
			transform: true,
			fromDate: this.state.startDate,
			toDate: this.state.endDate
		});
	}

	generateHeaderTitle() {
		return (
			<div className="u-full-height aligner aligner--column">
				<Row className="u-margin-0px aligner-item">
					<Col className="u-full-height aligner aligner--hStart aligner--vCenter" xs={8}>
						<h4>Metrics Chart</h4>
					</Col>
					<Col className="u-full-height aligner aligner--hCenter aligner--vBottom" xs={4} />
				</Row>
				<Row className="u-margin-0px aligner-item">
					<Col className="u-full-height aligner aligner--hStart aligner--vCenter" xs={4}>
						{this.renderSelectBox()}
					</Col>
					{this.renderDateRangePickerUI()}
				</Row>
			</div>
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

export default Metrics;
