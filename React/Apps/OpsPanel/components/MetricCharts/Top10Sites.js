import React, { Component } from 'react';
import { Panel, Row, Col, Table } from 'react-bootstrap';
import moment from 'moment';
import _ from 'lodash';
import extend from 'extend';
import PaneLoader from '../../../../Components/PaneLoader.jsx';
import SelectBox from '../../../../Components/SelectBox/index.jsx';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import '../../../ReportingPanel/styles.scss';

function generateTableData(inputData, metricName) {
	const metricInputData = inputData.aggregated[metricName];
	const capitalisedMetric = metricName.toUpperCase();
	const highlightStyles = {
			background: '#ecf7fc',
			border: '2px solid #47b6e4',
			color: '#167096'
		},
		metricsName = {
			PAGEVIEWS: 'PAGEVIEWS',
			IMPRESSIONS: 'IMPRESSIONS',
			REVENUE: 'REVENUE',
			CPM: 'CPM'
		},
		platformName = {
			DESKTOP: 'DESKTOP',
			MOBILE: 'MOBILE',
			TABLET: 'TABLET'
		},
		isMetricPageViews = !!(capitalisedMetric === metricsName.PAGEVIEWS),
		isMetricImpressions = !!(capitalisedMetric === metricsName.IMPRESSIONS),
		isMetricRevenue = !!(capitalisedMetric === metricsName.REVENUE),
		isMetricCPM = !!(capitalisedMetric === metricsName.CPM),
		metricsHeadingComputedStyles = {
			pageViews: isMetricPageViews ? highlightStyles : {},
			impressions: isMetricImpressions ? highlightStyles : {},
			revenue: isMetricRevenue ? highlightStyles : {},
			cpm: isMetricCPM ? highlightStyles : {}
		};

	return (
		<Table striped bordered hover responsive>
			<thead>
				<tr>
					<th>
						<h5>SITE ID</h5>
					</th>
					<th>
						<h5>SITE NAME</h5>
					</th>
					<th style={metricsHeadingComputedStyles.pageViews}>
						<h5>PAGE VIEWS</h5>
					</th>
					<th style={metricsHeadingComputedStyles.pageViews}>
						<h5>PV-DESKTOP</h5>
					</th>
					<th style={metricsHeadingComputedStyles.pageViews}>
						<h5>PV-MOBILE</h5>
					</th>
					<th style={metricsHeadingComputedStyles.pageViews}>
						<h5>PV-TABLET</h5>
					</th>
					<th style={metricsHeadingComputedStyles.impressions}>
						<h5>IMPRESSIONS</h5>
					</th>
					<th style={metricsHeadingComputedStyles.impressions}>
						<h5>IMPR-DESKTOP</h5>
					</th>
					<th style={metricsHeadingComputedStyles.impressions}>
						<h5>IMPR-MOBILE</h5>
					</th>
					<th style={metricsHeadingComputedStyles.impressions}>
						<h5>IMPR-TABLET</h5>
					</th>
					<th style={metricsHeadingComputedStyles.revenue}>
						<h5>REVENUE</h5>
					</th>
					<th style={metricsHeadingComputedStyles.revenue}>
						<h5>REV-DESKTOP</h5>
					</th>
					<th style={metricsHeadingComputedStyles.revenue}>
						<h5>REV-MOBILE</h5>
					</th>
					<th style={metricsHeadingComputedStyles.revenue}>
						<h5>REV-TABLET</h5>
					</th>
					<th style={metricsHeadingComputedStyles.cpm}>
						<h5>CPM</h5>
					</th>
					<th style={metricsHeadingComputedStyles.cpm}>
						<h5>CPM-DESKTOP</h5>
					</th>
					<th style={metricsHeadingComputedStyles.cpm}>
						<h5>CPM-MOBILE</h5>
					</th>
					<th style={metricsHeadingComputedStyles.cpm}>
						<h5>CPM-TABLET</h5>
					</th>
				</tr>
			</thead>
			<tbody>
				{metricInputData.map((metricObject, key) => {
					const isPlatformDesktop = !!metricObject[platformName.DESKTOP],
						isPlatformMobile = !!metricObject[platformName.MOBILE],
						isPlatformTablet = !!metricObject[platformName.TABLET],
						desktopMetrics = {
							pageViews: isPlatformDesktop ? metricObject[platformName.DESKTOP].pageViews : 0,
							impressions: isPlatformDesktop ? metricObject[platformName.DESKTOP].impressions : 0,
							revenue: isPlatformDesktop ? metricObject[platformName.DESKTOP].revenue : 0,
							cpm: isPlatformDesktop ? metricObject[platformName.DESKTOP].cpm : 0
						},
						mobileMetrics = {
							pageViews: isPlatformMobile ? metricObject[platformName.MOBILE].pageViews : 0,
							impressions: isPlatformMobile ? metricObject[platformName.MOBILE].impressions : 0,
							revenue: isPlatformMobile ? metricObject[platformName.MOBILE].revenue : 0,
							cpm: isPlatformMobile ? metricObject[platformName.MOBILE].cpm : 0
						},
						tabletMetrics = {
							pageViews: isPlatformTablet ? metricObject[platformName.TABLET].pageViews : 0,
							impressions: isPlatformTablet ? metricObject[platformName.TABLET].impressions : 0,
							revenue: isPlatformTablet ? metricObject[platformName.TABLET].revenue : 0,
							cpm: isPlatformTablet ? metricObject[platformName.TABLET].cpm : 0
						};

					return (
						<tr key={`table-row-${key}`}>
							<td>
								<a target="_blank" href="/ops/sitesMapping">
									{metricObject.siteId}
								</a>
							</td>
							<td>
								<a target="_blank" href={`http://${metricObject.siteName}`}>
									{metricObject.siteName}
								</a>
							</td>

							<td>{metricObject.pageViews}</td>
							<td>{desktopMetrics.pageViews}</td>
							<td>{mobileMetrics.pageViews}</td>
							<td>{tabletMetrics.pageViews}</td>

							<td>{metricObject.impressions}</td>
							<td>{desktopMetrics.impressions}</td>
							<td>{mobileMetrics.impressions}</td>
							<td>{tabletMetrics.impressions}</td>

							<td>{metricObject.revenue}</td>
							<td>{desktopMetrics.revenue}</td>
							<td>{mobileMetrics.revenue}</td>
							<td>{tabletMetrics.revenue}</td>

							<td>{metricObject.cpm}</td>
							<td>{desktopMetrics.cpm}</td>
							<td>{mobileMetrics.cpm}</td>
							<td>{tabletMetrics.cpm}</td>
						</tr>
					);
				})}
			</tbody>
		</Table>
	);
}

class Top10Sites extends Component {
	constructor(props) {
		super(props);
		let isDataLoaded =
			this.props.data && Object.keys(this.props.data).length && this.props.data.aggregated ? true : false;

		this.state = {
			isDataLoaded,
			data: isDataLoaded ? this.props.data : null,
			selectedMetric: 'pageViews',
			startDate: moment().subtract(7, 'days'),
			endDate: moment().subtract(1, 'days')
		};
		this.renderMetricTable = this.renderMetricTable.bind(this);
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
			: this.props.fetchData({
					transform: true,
					fromDate: this.state.startDate,
					toDate: this.state.endDate
				});
	}

	componentWillReceiveProps(nextProps) {
		let isDataLoaded =
				nextProps.data && Object.keys(nextProps.data).length && nextProps.data.aggregated ? true : false,
			data = isDataLoaded ? Object.assign(nextProps.data) : null;

		this.setState({ isDataLoaded, data });
	}

	renderMetricTable() {
		let inputData = this.state.data,
			metricName = this.state.selectedMetric,
			generatedTable = generateTableData(inputData, metricName);

		return generatedTable;
	}

	handleSelectBoxChange(metric = 'pageViews') {
		metric = metric || 'pageViews';

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
				<option key="0" value="pageViews">
					PAGEVIEWS
				</option>
				<option key="1" value="impressions">
					IMPRESSIONS
				</option>
				<option key="2" value="revenue">
					REVENUE
				</option>
				<option key="3" value="cpm">
					CPM
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

		if (isReset) {
			stateObject.startDate = parameterConfig.fromDate;
			stateObject.endDate = parameterConfig.toDate;
		}

		this.setState(stateObject, () => {
			this.props.fetchData(parameterConfig);
		});
	}

	generateHeaderTitle() {
		return (
			<div className="u-full-height aligner aligner--column">
				<Row className="u-margin-0px aligner-item">
					<Col className="u-full-height aligner aligner--hStart aligner--vCenter" xs={8}>
						<h4>Top 10 Sites Chart</h4>
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
				{this.state.isDataLoaded ? this.renderMetricTable() : <PaneLoader />}
			</Panel>
		);
	}
}

export default Top10Sites;
