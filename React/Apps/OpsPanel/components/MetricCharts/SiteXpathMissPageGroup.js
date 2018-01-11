import React, { Component } from 'react';
import { Panel, Row, Col, Table } from 'react-bootstrap';
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

function generateTableData(inputData, pageGroupName) {
	const pageGroupInputData = inputData[pageGroupName].data;
	let dataCollection = [];

	_.forEach(pageGroupInputData, (pageGroupDataObject, idx) => {
		const url = pageGroupDataObject.url,
			xpathMissCount = pageGroupDataObject.xpathMissCount,
			collectionItem = {
				pageGroupName,
				url,
				xpathMissCount
			};

		dataCollection.push(extend(true, {}, collectionItem));
	});

	return (
		<Table striped bordered hover responsive className="u-margin-t10px">
			<thead>
				<tr>
					<th>
						<h5>PAGEGROUP</h5>
					</th>
					<th>
						<h5>URL</h5>
					</th>
					<th>
						<h5>XPATH MISS COUNT</h5>
					</th>
				</tr>
			</thead>
			<tbody>
				{dataCollection.map((xpathMissObject, key) => {
					return (
						<tr key={`table-row-${key}`}>
							<td>{xpathMissObject.pageGroupName}</td>
							<td>
								<a target="_blank" href={`http://${xpathMissObject.url}`}>
									{xpathMissObject.url}
								</a>
							</td>

							<td>{xpathMissObject.xpathMissCount}</td>
						</tr>
					);
				})}
			</tbody>
		</Table>
	);
}

function generateHighChartConfig(inputData) {
	const chartConfig = extend(true, {}, PIE_CHART_CONFIG),
		contributionData = inputData.contribution.concat([]),
		seriesData = contributionData.map(modeContributionObject => {
			const key = Object.keys(modeContributionObject)[0],
				value = modeContributionObject[key];

			return {
				name: key,
				y: value,
				xpathMissCount: inputData.aggregated[key]
			};
		});

	chartConfig.series[0].data = seriesData.concat([]);
	chartConfig.tooltip.pointFormat = '{series.name}: <b>{point.percentage:.1f}%</b><br>PV: {point.xpathMissCount}';
	return chartConfig;
}

class SiteXpathMissPageGroup extends Component {
	constructor(props) {
		super(props);
		let isDataLoaded =
			this.props.data &&
			Object.keys(this.props.data).length &&
			this.props.data.aggregated &&
			this.props.data.pageGroupWise &&
			this.props.data.contribution
				? true
				: false;

		this.state = {
			isDataLoaded,
			data: isDataLoaded ? this.props.data : null,
			count: this.props.count || 20,
			selectedPageGroup: '',
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
		this.handleSelectBoxChange = this.handleSelectBoxChange.bind(this);
		this.renderSelectBox = this.renderSelectBox.bind(this);
		this.renderListTable = this.renderListTable.bind(this);
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
				nextProps.data.pageGroupWise &&
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

			$.post(`/ops/getSiteXpathMissPageGroupData`, apiParameters, response => {
				_ref.setState({
					data: response.data,
					isDataLoaded: true
				});
			});
		});
	}

	handleSelectBoxChange(pageGroup = '') {
		this.setState({
			selectedPageGroup: pageGroup
		});
	}

	renderSelectBox() {
		const isPageGroupData = !!this.state.data && this.state.data.pageGroupWise,
			pageGroupData = isPageGroupData ? Object.keys(this.state.data.pageGroupWise) : [];

		return (
			<SelectBox
				value={this.state.selectedPageGroup}
				label="Select PageGroup"
				onChange={this.handleSelectBoxChange}
				onClear={this.handleSelectBoxChange}
				disabled={false}
			>
				{pageGroupData.map((pageGroupName, idx) => (
					<option key={idx} value={pageGroupName}>
						{pageGroupName}
					</option>
				))}
			</SelectBox>
		);
	}

	renderListTable() {
		let inputData = this.state.data.pageGroupWise,
			pageGroupName = this.state.selectedPageGroup || Object.keys(this.state.data.pageGroupWise)[0],
			generatedTable = generateTableData(inputData, pageGroupName);

		return generatedTable;
	}

	generateHeaderTitle() {
		return (
			<div className="u-full-height aligner aligner--column">
				<Row className="u-margin-0px aligner-item">
					<Col className="u-full-height aligner aligner--hStart aligner--vCenter" xs={8}>
						<h4>XpathMiss PageGroup Chart</h4>
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
				{this.state.isDataLoaded ? this.renderListTable() : null}
			</Panel>
		);
	}
}

export default SiteXpathMissPageGroup;
