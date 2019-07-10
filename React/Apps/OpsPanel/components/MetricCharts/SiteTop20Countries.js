import React, { Component } from 'react';
import { Panel, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import _ from 'lodash';
import extend from 'extend';
import ReactHighCharts from 'react-highcharts';
import PaneLoader from '../../../../Components/PaneLoader.jsx';
import { PIE_CHART_CONFIG } from '../../configs/commonConsts';
import SelectBox from '../../../../Components/SelectBox/index.jsx';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import '../../../ReportingPanel/styles.scss';

function generateHighChartConfig(inputData) {
	const chartConfig = extend(true, {}, PIE_CHART_CONFIG),
		contributionData = inputData.contribution.concat([]),
		seriesData = contributionData.map(modeContributionObject => {
			const key = Object.keys(modeContributionObject)[0],
				value = modeContributionObject[key],
				pageViews = _.find(inputData.aggregated, { country: key }).pageViews;

			return {
				name: key,
				y: value,
				pageViews
			};
		});

	chartConfig.series[0].data = seriesData.concat([]);
	chartConfig.tooltip.pointFormat = '{series.name}: <b>{point.percentage:.1f}%</b><br>PV: {point.pageViews}';
	return chartConfig;
}

class SiteTop20Countries extends Component {
	constructor(props) {
		super(props);
		let isDataLoaded =
			this.props.data &&
			Object.keys(this.props.data).length &&
			this.props.data.aggregated &&
			this.props.data.dayWise &&
			this.props.data.contribution
				? true
				: false;

		this.state = {
			isDataLoaded,
			data: isDataLoaded ? this.props.data : null,
			count: this.props.count || 11,
			startDate: moment().subtract(7, 'days'),
			endDate: moment().subtract(1, 'days'),
			siteId: window.siteId
		};
		this.renderHighCharts = this.renderHighCharts.bind(this);
		this.generateHeaderTitle = this.generateHeaderTitle.bind(this);
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
					toDate: this.state.endDate,
					count: this.state.count
				});
	}

	componentWillReceiveProps(nextProps) {
		let isDataLoaded =
				nextProps.data &&
				Object.keys(nextProps.data).length &&
				nextProps.data.aggregated &&
				nextProps.data.dayWise &&
				nextProps.data.contribution
					? true
					: false,
			data = isDataLoaded ? Object.assign(nextProps.data) : null;

		this.setState({ isDataLoaded, data });
	}

	renderHighCharts() {
		let inputData = this.state.data,
			config = generateHighChartConfig(inputData);

		return <ReactHighCharts config={config} />;
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

			$.post(`/ops/getSiteTop20CountriesData`, apiParameters, response => {
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
						<h4>Top 20 Countries Traffic Chart</h4>
					</Col>
					<Col className="u-full-height aligner aligner--hCenter aligner--vBottom" xs={4} />
				</Row>
				<Row className="u-margin-0px aligner-item">
					<Col className="u-full-height aligner aligner--hStart aligner--vCenter" xs={3}>
						{/* <input
							type="number"
							name="countriesCount"
							placeholder="Enter country count"
							value={this.state.count}
							onChange={ev => this.setState({ count: ev.target.value })}
							className="inputMinimal"
						/> */}
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

export default SiteTop20Countries;
