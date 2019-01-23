import React, { Component } from 'react';
import { Panel, Row, Col, Table, PageHeader, PanelGroup, Badge, Label } from 'react-bootstrap';
import moment from 'moment';
import _ from 'lodash';
import extend from 'extend';
import PaneLoader from '../../../../Components/PaneLoader.jsx';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import '../../../ReportingPanel/styles.scss';

function getMetricTableData(metricData) {
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
				</tr>
			</thead>
			<tbody>
				{metricData.map((metricObject, key) => {
					return (
						<tr key={`table-row-${key}`}>
							<td>
								<a target="_blank" href="/ops/sitesMapping">
									{metricObject.siteid}
								</a>
							</td>
							<td>
								<a target="_blank" href={`http://${metricObject.name}`}>
									{metricObject.name}
								</a>
							</td>
						</tr>
					);
				})}
			</tbody>
		</Table>
	);
}

function isDataValid(inputData) {
	return !!(
		inputData &&
		Object.keys(inputData).length &&
		inputData.lost &&
		inputData.found &&
		inputData.same &&
		inputData.dateFormat
	);
}

class LostAndFoundLiveSites extends Component {
	constructor(props) {
		super(props);
		let isDataLoaded = isDataValid(props.data);

		this.state = {
			isDataLoaded,
			data: isDataLoaded ? props.data : null,
			threshold: 1000,
			thisWeekFromDate: moment().subtract(7, 'days'),
			thisWeekToDate: moment().subtract(1, 'days'),
			lastWeekFromDate: moment().subtract(14, 'days'),
			lastWeekToDate: moment().subtract(8, 'days'),
			panelGroupActiveKey: '1'
		};
		this.renderMetricTable = this.renderMetricTable.bind(this);
		this.generateHeaderTitle = this.generateHeaderTitle.bind(this);
		this.renderInteractionUI = this.renderInteractionUI.bind(this);
		this.generateTableData = this.generateTableData.bind(this);

		this.handleLastWeekDatesChange = this.handleLastWeekDatesChange.bind(this);
		this.handleThisWeekDatesChange = this.handleThisWeekDatesChange.bind(this);
		this.handleLastWeekFocusChange = this.handleLastWeekFocusChange.bind(this);
		this.handleThisWeekFocusChange = this.handleThisWeekFocusChange.bind(this);
		this.handlePanelGroupSelectChange = this.handlePanelGroupSelectChange.bind(this);

		this.fetchReportData = this.fetchReportData.bind(this);
		this.getComputedParameterConfig = this.getComputedParameterConfig.bind(this);
		this.getDefaultParameterConfig = this.getDefaultParameterConfig.bind(this);
	}

	generateTableData(inputData) {
		const lostSitesData = inputData.lost,
			foundSitesData = inputData.found,
			sameSitesData = inputData.same,
			dateFormat = inputData.dateFormat,
			sitesCount = {
				total: inputData.total,
				lost: inputData.lost.length,
				found: inputData.found.length,
				same: inputData.same.length
			},
			paragraphStyles = {
				fontSize: '16px'
			};

		return (
			<div>
				<p className="aligner aligner--vCenter aligner--hStart" style={paragraphStyles}>
					<Label className="u-margin-r10px">Last Week</Label> {dateFormat.lastWeek}
				</p>
				<p className="aligner aligner--vCenter aligner--hStart" style={paragraphStyles}>
					<Label className="u-margin-r10px">This Week</Label> {dateFormat.thisWeek}
				</p>
				<p className="u-margin-b15px aligner aligner--vCenter aligner--hStart" style={paragraphStyles}>
					<Label className="u-margin-r10px">Total Sites</Label> {sitesCount.total}
				</p>
				<PanelGroup
					activeKey={this.state.panelGroupActiveKey}
					onSelect={this.handlePanelGroupSelectChange}
					accordion
				>
					<Panel
						header={
							<h4 className="u-cursor-pointer">
								LOST <Badge>{sitesCount.lost}</Badge>
							</h4>
						}
						eventKey="1"
					>
						{getMetricTableData(lostSitesData)}
					</Panel>
					<Panel
						header={
							<h4 className="u-cursor-pointer">
								NEW <Badge>{sitesCount.found}</Badge>
							</h4>
						}
						eventKey="2"
					>
						{getMetricTableData(foundSitesData)}
					</Panel>
					<Panel
						header={
							<h4 className="u-cursor-pointer">
								RETENTION <Badge>{sitesCount.same}</Badge>
							</h4>
						}
						eventKey="3"
					>
						{getMetricTableData(sameSitesData)}
					</Panel>
				</PanelGroup>
			</div>
		);
	}

	getComputedParameterConfig() {
		const parameterConfig = {
			transform: true,
			threshold: this.state.threshold,
			thisWeek: {
				from: this.state.thisWeekFromDate,
				to: this.state.thisWeekToDate
			},
			lastWeek: {
				from: this.state.lastWeekFromDate,
				to: this.state.lastWeekToDate
			}
		};

		return parameterConfig;
	}

	getDefaultParameterConfig() {
		const parameterConfig = {
			transform: true,
			threshold: 1000,
			thisWeek: {
				from: moment()
					.subtract(7, 'days')
					.format('YYYY-MM-DD'),
				to: moment()
					.subtract(1, 'days')
					.format('YYYY-MM-DD')
			},
			lastWeek: {
				from: moment()
					.subtract(14, 'days')
					.format('YYYY-MM-DD'),
				to: moment()
					.subtract(8, 'days')
					.format('YYYY-MM-DD')
			}
		};

		return parameterConfig;
	}

	componentDidMount() {
		const parameterConfig = this.getComputedParameterConfig();

		this.state.isDataLoaded ? null : this.props.fetchData(parameterConfig);
	}

	componentWillReceiveProps(nextProps) {
		let isDataLoaded = isDataValid(nextProps.data),
			data = isDataLoaded ? Object.assign(nextProps.data) : null;

		this.setState({ isDataLoaded, data });
	}

	renderMetricTable() {
		let inputData = this.state.data,
			generatedTable = this.generateTableData(inputData);

		return generatedTable;
	}

	handlePanelGroupSelectChange(panelGroupActiveKey) {
		this.setState({ panelGroupActiveKey });
	}

	handleThisWeekDatesChange({ startDate, endDate }) {
		this.setState({ thisWeekFromDate: startDate, thisWeekToDate: endDate });
	}

	handleThisWeekFocusChange(thisWeekFocusInput) {
		this.setState({ thisWeekFocusInput });
	}

	handleLastWeekDatesChange({ startDate, endDate }) {
		this.setState({ lastWeekFromDate: startDate, lastWeekToDate: endDate });
	}

	handleLastWeekFocusChange(lastWeekFocusInput) {
		this.setState({ lastWeekFocusInput });
	}

	renderInteractionUI() {
		return (
			<Col className="u-full-height aligner aligner--hBottom aligner--vCenter" xs={12}>
				<DateRangePicker
					onDatesChange={this.handleLastWeekDatesChange}
					onFocusChange={this.handleLastWeekFocusChange}
					focusedInput={this.state.lastWeekFocusInput}
					startDate={this.state.lastWeekFromDate}
					endDate={this.state.lastWeekToDate}
					hideKeyboardShortcutsPanel={true}
					showClearDates={true}
					minimumNights={0}
					displayFormat={'DD-MM-YYYY'}
					isOutsideRange={() => {}}
				/>

				<DateRangePicker
					onDatesChange={this.handleThisWeekDatesChange}
					onFocusChange={this.handleThisWeekFocusChange}
					focusedInput={this.state.thisWeekFocusInput}
					startDate={this.state.thisWeekFromDate}
					endDate={this.state.thisWeekToDate}
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

	fetchReportData(isReset = false) {
		const parameterConfig = isReset ? this.getDefaultParameterConfig() : this.getComputedParameterConfig();
		let stateObject = {
			isDataLoaded: false
		};

		if (isReset) {
			stateObject.lastWeekFromDate = moment(parameterConfig.lastWeek.from);
			stateObject.lastWeekToDate = moment(parameterConfig.lastWeek.to);
			stateObject.thisWeekFromDate = moment(parameterConfig.thisWeek.from);
			stateObject.thisWeekToDate = moment(parameterConfig.thisWeek.to);
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
						<h4>Lost And Found Live Sites Chart</h4>
					</Col>
					<Col className="u-full-height aligner aligner--hCenter aligner--vBottom" xs={4} />
				</Row>
				<Row className="u-margin-0px aligner-item">{this.renderInteractionUI()}</Row>
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

export default LostAndFoundLiveSites;
