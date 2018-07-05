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

function generateTopUrlsTable(inputData) {
	return (
		<Table striped bordered hover responsive className="u-margin-t10px">
			<thead>
				<tr>
					<th>
						<h5>URL</h5>
					</th>
					<th>
						<h5>COUNT</h5>
					</th>
					<th>
						<h5>COUNT FORMAT</h5>
					</th>
				</tr>
			</thead>
			<tbody>
				{inputData.map((topUrlsObject, key) => {
					return (
						<tr key={`table-row-${key}`}>
							<td>
								<a target="_blank" href={`${topUrlsObject.url}`}>
									{topUrlsObject.url}
								</a>
							</td>
							<td>{topUrlsObject.count}</td>

							<td>{topUrlsObject.countDesc}</td>
						</tr>
					);
				})}
			</tbody>
		</Table>
	);
}

function generateTableData(inputData, modeName) {
	const modeInputData = inputData[modeName];
	let dataCollection = [];

	_.forOwn(modeInputData, (siteDataObject, siteId) => {
		const siteName = siteDataObject.name,
			pageViews = siteDataObject.pageViews,
			collectionItem = {
				siteId,
				siteName,
				pageViews
			};

		dataCollection.push(extend(true, {}, collectionItem));
	});

	return (
		<Table striped bordered hover responsive className="u-margin-t10px">
			<thead>
				<tr>
					<th>
						<h5>SITE ID</h5>
					</th>
					<th>
						<h5>SITE NAME</h5>
					</th>
					<th>
						<h5>PAGE VIEWS</h5>
					</th>
				</tr>
			</thead>
			<tbody>
				{dataCollection.map((siteObject, key) => {
					return (
						<tr key={`table-row-${key}`}>
							<td>
								<a target="_blank" href="/ops/sitesMapping">
									{siteObject.siteId}
								</a>
							</td>
							<td>
								<a target="_blank" href={`http://${siteObject.siteName}`}>
									{siteObject.siteName}
								</a>
							</td>

							<td>{siteObject.pageViews}</td>
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
				pageViews: inputData.aggregated[key]
			};
		});

	chartConfig.series[0].data = seriesData.concat([]);
	chartConfig.tooltip.pointFormat = '{series.name}: <b>{point.percentage:.1f}%</b><br>PV: {point.pageViews}';
	return chartConfig;
}

class SiteModeWiseTraffic extends Component {
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
			topUrlsData: null,
			isTopUrlsButtonLoading: false,
			isMainButtonLoading: false,
			selectedMode: '1',
			selectedPlatformCode: '',
			urlCount: 20,
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
		this.fetchModeWiseTopUrlsData = this.fetchModeWiseTopUrlsData.bind(this);
		this.getComputedParameterConfig = this.getComputedParameterConfig.bind(this);
		this.getDefaultParameterConfig = this.getDefaultParameterConfig.bind(this);
		this.handleSelectBoxChange = this.handleSelectBoxChange.bind(this);
		this.handlePlatformSelectBoxChange = this.handlePlatformSelectBoxChange.bind(this);
		this.renderModeSelectBox = this.renderModeSelectBox.bind(this);
		this.renderPlatformSelectBox = this.renderPlatformSelectBox.bind(this);
		this.renderModeTable = this.renderModeTable.bind(this);
		this.renderTopUrlsCountTable = this.renderTopUrlsCountTable.bind(this);
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
		const isMainButtonLoading = this.state.isMainButtonLoading;

		return (
			<Col className="u-full-height aligner aligner--hBottom aligner--vStart" xs={8}>
				{this.renderPlatformSelectBox()}
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
					disabled={isMainButtonLoading}
					className="btn btn-lightBg btn-default btn-blue u-margin-l10px"
					onClick={!isMainButtonLoading ? eve => this.fetchReportData() : null}
				>
					{isMainButtonLoading ? 'Loading Data...' : 'Generate'}
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
			isDataLoaded: false,
			isMainButtonLoading: true
		};
		let _ref = this;

		if (isReset) {
			stateObject.startDate = parameterConfig.fromDate;
			stateObject.endDate = parameterConfig.toDate;
			stateObject.topUrlsData = null;
			stateObject.selectedPlatformCode = '';
		}

		this.setState(stateObject, () => {
			const apiParameters = Object.assign({}, parameterConfig);

			apiParameters.fromDate = moment(apiParameters.fromDate).format('YYYY-MM-DD');
			apiParameters.toDate = moment(apiParameters.toDate).format('YYYY-MM-DD');
			apiParameters.siteId = _ref.state.siteId;
			apiParameters.platformCode = _ref.state.selectedPlatformCode || '';

			$.post(`/ops/getSiteModeWiseData`, apiParameters)
				.done(function(response) {
					_ref.setState({
						data: response.data,
						isDataLoaded: true,
						isMainButtonLoading: false
					});
				})
				.fail(function() {
					window.alert('Failed to load Mode Wise Traffic Chart data. Please try again after some time.');

					_ref.setState({
						isMainButtonLoading: false
					});
				});
		});
	}

	fetchModeWiseTopUrlsData() {
		const parameterConfig = this.getComputedParameterConfig(),
			_ref = this;

		parameterConfig.fromDate = moment(parameterConfig.fromDate).format('YYYY-MM-DD');
		parameterConfig.toDate = moment(parameterConfig.toDate).format('YYYY-MM-DD');
		parameterConfig.siteId = _ref.state.siteId;
		parameterConfig.count = _ref.state.urlCount;
		parameterConfig.mode = Number(_ref.state.selectedMode);
		parameterConfig.platformCode = _ref.state.selectedPlatformCode || '';

		_ref.setState(
			{
				isTopUrlsButtonLoading: true
			},
			() => {
				$.post(`/ops/getSiteModeWiseTopUrlsData`, parameterConfig)
					.done(function(response) {
						_ref.setState({
							topUrlsData: response.data,
							isTopUrlsButtonLoading: false
						});
					})
					.fail(function() {
						window.alert('Failed to load Mode Wise Top urls. Please try again after some time.');

						_ref.setState({
							isTopUrlsButtonLoading: false
						});
					});
			}
		);
	}

	handleSelectBoxChange(mode = '1') {
		mode = mode || '1';

		this.setState({
			selectedMode: mode,
			topUrlsData: null
		});
	}

	handlePlatformSelectBoxChange(platformCode = '') {
		platformCode = platformCode || '';

		this.setState({
			selectedPlatformCode: platformCode,
			topUrlsData: null
		});
	}

	renderModeSelectBox() {
		const isModeData = !!this.state.data && this.state.data.sitewise,
			siteWiseData = isModeData ? Object.keys(this.state.data.sitewise) : [];

		return (
			<SelectBox
				value={this.state.selectedMode}
				label="Select Mode"
				onChange={this.handleSelectBoxChange}
				onClear={this.handleSelectBoxChange}
				disabled={false}
			>
				{siteWiseData.map((modeName, idx) => (
					<option key={idx} value={modeName}>
						{modeName}
					</option>
				))}
			</SelectBox>
		);
	}

	renderPlatformSelectBox() {
		return (
			<SelectBox
				className="u-margin-r10px"
				value={this.state.selectedPlatformCode}
				label="Select Platform"
				onChange={this.handlePlatformSelectBoxChange}
				onClear={this.handlePlatformSelectBoxChange}
			>
				<option value="2">DESKTOP</option>
				<option value="1,4">MOBILE</option>
				<option value="5">TABLET</option>
			</SelectBox>
		);
	}

	renderModeTable() {
		let inputData = this.state.data.sitewise,
			modeName = this.state.selectedMode,
			generatedTable = generateTableData(inputData, modeName);

		return generatedTable;
	}

	renderTopUrlsCountTable() {
		let inputData = this.state.topUrlsData,
			generatedTable = generateTopUrlsTable(inputData);

		return generatedTable;
	}

	generateHeaderTitle() {
		const isTopUrlsButtonLoading = this.state.isTopUrlsButtonLoading;

		return (
			<div className="u-full-height aligner aligner--column">
				<Row className="u-margin-0px aligner-item">
					<Col className="u-full-height aligner aligner--hStart aligner--vCenter" xs={8}>
						<h4>Mode Wise Traffic Chart</h4>
					</Col>
					<Col className="u-full-height aligner aligner--hCenter aligner--vCenter" xs={4} />
				</Row>
				<Row className="u-margin-0px aligner-item">
					<Col className="u-full-height aligner aligner--hStart aligner--vStart" xs={4}>
						{this.renderModeSelectBox()}
						<button
							disabled={isTopUrlsButtonLoading}
							className="btn btn-lightBg btn-default btn-blue u-margin-l10px"
							onClick={!isTopUrlsButtonLoading ? eve => this.fetchModeWiseTopUrlsData() : null}
						>
							{isTopUrlsButtonLoading ? 'Loading Top Urls...' : 'Get Top Urls'}
						</button>
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
			<Panel className="mb-20 metricsChart metricsChart--modeWiseTraffic" header={headerTitle}>
				{this.state.isDataLoaded ? this.renderHighCharts() : <PaneLoader />}
				{this.state.isDataLoaded ? this.renderModeTable() : null}
				{this.state.topUrlsData ? this.renderTopUrlsCountTable() : null}
			</Panel>
		);
	}
}

export default SiteModeWiseTraffic;
