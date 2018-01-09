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

function generateHighChartConfig(inputData, platformName) {
	const chartConfig = extend(true, {}, LINE_CHART_CONFIG),
		categories = inputData.dateFormat.collection.concat([]),
		seriesObject = {
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
	let isPlatform = !!platformName,
		contributionData;

	if (!isPlatform) {
		contributionData = extend(true, {}, inputData.dayWise);
	} else {
		platformName = platformName.toUpperCase();
		contributionData = extend(true, {}, inputData.platform[platformName].dayWise);
	}

	chartConfig.yAxis.title.text = `VALUE ($)`;
	chartConfig.title.text = isPlatform ? `${platformName} Metrics Performance` : `Metrics Performance`;
	chartConfig.xAxis.categories = chartConfig.xAxis.categories.concat(categories);

	_.forOwn(contributionData, (dayWiseObject, dateKey) => {
		seriesObject.revenue.data.push(dayWiseObject.revenue);
		seriesObject.impressions.data.push(dayWiseObject.impressions);
		seriesObject.pageViews.data.push(dayWiseObject.pageViews);
		seriesObject.cpm.data.push(dayWiseObject.cpm);
	});

	chartConfig.series.push(extend(true, {}, seriesObject.revenue));
	chartConfig.series.push(extend(true, {}, seriesObject.impressions));
	chartConfig.series.push(extend(true, {}, seriesObject.pageViews));
	chartConfig.series.push(extend(true, {}, seriesObject.cpm));

	return chartConfig;
}

class SiteMetrics extends Component {
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
			selectedPlatform: '',
			startDate: moment().subtract(7, 'days'),
			endDate: moment().subtract(1, 'day'),
			siteId: window.siteId
		};
		this.renderHighCharts = this.renderHighCharts.bind(this);
		this.generateHeaderTitle = this.generateHeaderTitle.bind(this);
		this.handleSelectBoxChange = this.handleSelectBoxChange.bind(this);
		this.renderSelectBox = this.renderSelectBox.bind(this);
		this.renderDateRangePickerUI = this.renderDateRangePickerUI.bind(this);
		this.datesUpdated = this.datesUpdated.bind(this);
		this.focusUpdated = this.focusUpdated.bind(this);
		this.fetchReportData = this.fetchReportData.bind(this);
		this.getComputedParameterConfig = this.getComputedParameterConfig.bind(this);
		this.getDefaultParameterConfig = this.getDefaultParameterConfig.bind(this);
	}

	componentDidMount() {
		this.state.isDataLoaded
			? null
			: this.fetchReportData({
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
			platformName = this.state.selectedPlatform,
			config = generateHighChartConfig(inputData, platformName);

		return <ReactHighCharts config={config} />;
	}

	handleSelectBoxChange(platform = '') {
		platform = platform || '';

		this.setState({
			selectedPlatform: platform
		});
	}

	renderSelectBox() {
		const isPlatformData = !!this.state.data && this.state.data.platform,
			platformData = isPlatformData ? Object.keys(this.state.data.platform) : [];

		return (
			<SelectBox
				value={this.state.selectedPlatform}
				label="Select Platform"
				onChange={this.handleSelectBoxChange}
				onClear={this.handleSelectBoxChange}
				disabled={false}
			>
				{platformData.map((platformName, idx) => (
					<option key={idx} value={platformName}>
						{platformName}
					</option>
				))}
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
			<Col className="u-full-height aligner aligner--hBottom aligner--vCenter" xs={9}>
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

	getComputedParameterConfig() {
		const parameterConfig = {
			transform: true,
			fromDate: this.state.startDate,
			toDate: this.state.endDate
		};

		return parameterConfig;
	}

	getDefaultParameterConfig() {
		const parameterConfig = {
			transform: true,
			fromDate: moment().subtract(7, 'days'),
			toDate: moment().subtract(1, 'day')
		};

		return parameterConfig;
	}

	fetchReportData(isReset = false) {
		const parameterConfig = isReset ? this.getDefaultParameterConfig() : this.getComputedParameterConfig();
		let stateObject = {
			isDataLoaded: false
		};
		let _ref = this;

		if (isReset) {
			stateObject.startDate = parameterConfig.fromDate;
			stateObject.endDate = parameterConfig.toDate;
		}

		this.setState(stateObject, () => {
			const apiParameters = Object.assign({}, parameterConfig);

			apiParameters.fromDate = moment(apiParameters.fromDate).format('YYYY-MM-DD');
			apiParameters.toDate = moment(apiParameters.toDate).format('YYYY-MM-DD');
			apiParameters.siteId = _ref.state.siteId;

			$.post(`/ops/getSiteMetricsData`, apiParameters, response => {
				_ref.setState({
					data: response.data,
					isDataLoaded: true
				});
			});
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
					<Col className="u-full-height aligner aligner--hStart aligner--vCenter" xs={3}>
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

export default SiteMetrics;
