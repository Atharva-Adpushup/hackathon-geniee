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
			REVENUE: 'REVENUE'
		},
		isMetricPageViews = !!(capitalisedMetric === metricsName.PAGEVIEWS),
		isMetricImpressions = !!(capitalisedMetric === metricsName.IMPRESSIONS),
		isMetricRevenue = !!(capitalisedMetric === metricsName.REVENUE),
		metricsHeadingComputedStyles = {
			pageViews: isMetricPageViews ? highlightStyles : {},
			impressions: isMetricImpressions ? highlightStyles : {},
			revenue: isMetricRevenue ? highlightStyles : {}
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
					<th style={metricsHeadingComputedStyles.impressions}>
						<h5>IMPRESSIONS</h5>
					</th>
					<th style={metricsHeadingComputedStyles.revenue}>
						<h5>REVENUE</h5>
					</th>
				</tr>
			</thead>
			<tbody>
				{metricInputData.map((metricObject, key) => {
					return (
						<tr key={`table-row-${key}`}>
							<td>
								<a target="_blank" href="/ops/sitesMapping">
									{metricObject.siteId}
								</a>
							</td>
							<td>
								<a target="_blank" href="/ops/sitesMapping">
									{metricObject.siteName}
								</a>
							</td>
							<td>{metricObject.pageViews}</td>
							<td>{metricObject.impressions}</td>
							<td>{metricObject.revenue}</td>
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
			startDate: moment()
				.subtract(7, 'days')
				.startOf('day'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day')
		};
		this.renderMetricTable = this.renderMetricTable.bind(this);
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
