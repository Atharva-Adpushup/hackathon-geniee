import React, { Component, Fragment } from 'react';
import { Glyphicon, Button, InputGroup, Alert } from '@/Client/helpers/react-bootstrap-imports';
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { CSVLink } from 'react-csv';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import moment from 'moment';
import PresetDateRangePicker from '../../../../Components/PresetDateRangePicker/index';
import SelectBox from '../../../../Components/SelectBox/index';
import { getPresets } from '../../helpers/utils';
import reportService from '../../../../services/reportService';
import {
	accountFilter,
	accountDimension,
	opsDimension,
	opsFilter,
	optionListForOrderByURLAndUTM
} from '../../configs/commonConsts';
import {
	getReportingControlDemoUserSites,
	getReportingDemoUserSiteIds
} from '../../../../helpers/commonFunctions';

class Control extends Component {
	constructor(props) {
		super(props);
		const selectedMetrics = props.isHB ? props.selectedMetrics : [];

		this.state = {
			dimensionList: props.dimensionList,
			filterList: props.filterList,
			metricsList: props.metricsList,
			selectedMetrics,
			selectedCharts: props.selectedCharts,
			chartList: props.hbMetricsList,
			intervalList: props.intervalList,
			orderByList: optionListForOrderByURLAndUTM,
			startDate: props.startDate,
			endDate: props.endDate,
			reportType: props.reportType,
			selectedDimension: props.selectedDimension || '',
			selectedInterval: props.selectedInterval || '',
			selectedOrder: props.selectedOrder || '',
			selectedOrderBy: props.selectedOrderBy || '',
			selectedTotalRecords: props.selectedTotalRecords || '',
			selectedFilters: props.selectedFilters || {},
			disableGenerateButton: false,
			updateStatusText: '',
			regexFilter: props.searchFilter,
			cutOffRevenue: props.revenueCutOff,
			csvData: props.csvData,
			fileName: 'adpushup-report'
		};
		this.onMetricsListChange = this.onMetricsListChange.bind(this);
		this.onChartListChange = this.onChartListChange.bind(this);
		this.onDebounceControlChange = debounce(this.onDebounceControlChange.bind(this), 250);
	}

	componentDidMount() {
		this.getReportStatus();
	}

	componentWillReceiveProps(nextProps) {
		const { state: currState } = this;
		const isCsvData = !!(nextProps && nextProps.csvData);
		const updateDimensionList = !isEqual(currState.dimensionList, nextProps.dimensionList);
		const updateFilterList = !isEqual(currState.filterList, nextProps.filterList);
		const updateMetricsList = !isEqual(currState.metricsList, nextProps.metricsList);

		const newState = {};
		newState.chartList = currState.chartList;
		if (isCsvData) newState.csvData = nextProps.csvData;
		if (updateDimensionList) newState.dimensionList = nextProps.dimensionList;
		if (updateFilterList) newState.filterList = nextProps.filterList;
		if (updateMetricsList) newState.metricsList = nextProps.metricsList;
		this.setState(newState);
	}

	onReportBySelect = selectedDimension => {
		const { reportType } = this.props;
		this.setState({ selectedDimension }, this.onControlChange.bind(null, reportType));
	};

	onFilteChange = selectedFilters => {
		const { defaultReportType } = this.props;
		let reportType = defaultReportType || 'account';
		const { filterList, dimensionList, hbMetricsList, metricsList } = this.props;
		const selectedSiteFilters = selectedFilters.siteid || {};
		if (selectedSiteFilters && Object.keys(selectedSiteFilters).length === 1) {
			reportType = 'site';
		}

		const {
			updatedFilterList,
			updatedDimensionList,
			updatedMetricsList,
			updatedChartList
		} = this.updateFilterDimensionList(
			reportType,
			defaultReportType,
			filterList,
			metricsList,
			hbMetricsList,
			dimensionList
		);
		this.setState(
			{
				dimensionList: updatedDimensionList,
				filterList: updatedFilterList,
				metricsList: updatedMetricsList,
				chartList: updatedChartList,
				reportType
			},
			() => this.onControlChange(reportType)
		);
	};

	onChartListChange = selectedCharts => {
		const { reportType } = this.props;
		this.setState({ selectedCharts }, this.onControlChange.bind(null, reportType));
	};

	onMetricsListChange = selectedMetrics => {
		const { reportType } = this.props;
		this.setState({ selectedMetrics }, this.onControlChange.bind(null, reportType));
	};

	onDebounceControlChange = reportType => {
		const resultObject = this.getStateParams();
		const { onControlChange } = this.props;
		onControlChange(resultObject, reportType);
	};

	onControlChange = reportType => {
		const resultObject = this.getStateParams();
		const { onControlChange } = this.props;
		onControlChange(resultObject, reportType);
	};

	onGenerateButtonClick = () => {
		const resultObject = this.getStateParams();
		const { generateButtonHandler } = this.props;

		generateButtonHandler(resultObject);
	};

	handleOnChange = e => {
		const { target } = e;
		const { name } = target;
		const { reportType } = this.props;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [name]: value }, this.onControlChange.bind(null, reportType));
	};

	getStateParams = () => {
		const {
			startDate,
			endDate,
			selectedInterval,
			selectedDimension,
			selectedFilters,
			selectedMetrics,
			selectedCharts,
			selectedOrder,
			selectedOrderBy,
			selectedTotalRecords,
			regexFilter,
			cutOffRevenue,
			reportType
		} = this.state;
		const resultObject = {
			startDate,
			endDate,
			selectedInterval,
			selectedDimension,
			selectedFilters,
			selectedMetrics,
			selectedCharts,
			selectedOrder,
			selectedOrderBy,
			selectedTotalRecords,
			regexFilter,
			revenueCutOff: cutOffRevenue,
			reportType
		};

		return resultObject;
	};

	getSelectedFilter = filter => {
		const { reportType, defaultReportType, selectedFilters, isDemoUser } = this.props;
		let siteIds = [];
		let isSuperUser = false;
		const selectedSiteIds = selectedFilters.siteid && Object.keys(selectedFilters.siteid);

		if (defaultReportType !== 'global' && filter.value === 'siteid') {
			const {
				userSites,
				user: {
					data: { email }
				}
			} = this.props;
			siteIds = Object.keys(userSites);
			siteIds = getReportingDemoUserSiteIds(siteIds, email, reportType, true);
		} else if (defaultReportType === 'global' && filter.value === 'siteid') {
			isSuperUser = true;
		} else if (reportType === 'account') {
			const {
				userSites,
				user: {
					data: { email }
				}
			} = this.props;

			if (selectedSiteIds && selectedSiteIds.length) {
				siteIds = selectedSiteIds;
			} else {
				siteIds = Object.keys(userSites);
				siteIds = getReportingDemoUserSiteIds(siteIds, email, reportType);
			}
		} else if (reportType === 'global') {
			if (selectedSiteIds && selectedSiteIds.length) {
				siteIds = selectedSiteIds;
			}

			isSuperUser = true;
		} else {
			siteIds = selectedSiteIds && selectedSiteIds.length ? selectedSiteIds : [];
		}

		const params = { siteid: siteIds.toString(), isSuperUser };
		return reportService
			.getWidgetData({ path: filter.path, params })
			.then(data => getReportingControlDemoUserSites(data, filter.path, isDemoUser));
	};

	getReportStatus = () => {
		reportService.getLastUpdateStatus().then(res => {
			if (res.status === 200 && res.data) {
				const updatedDate = res.data.lastRunTimePST;
				this.setState({
					updateStatusText: `Last updated on ${updatedDate}.`
				});
			}
		});
	};

	removeOpsFilterDimension = (filterList, dimensionList) => {
		const updatedFilterList = [];
		const updatedDimensionList = [];
		filterList.forEach(fil => {
			const index = opsFilter.indexOf(fil.value);
			if (index === -1) updatedFilterList.push(fil);
		});
		dimensionList.forEach(dim => {
			const index = opsDimension.indexOf(dim.value);
			if (index === -1) updatedDimensionList.push(dim);
		});
		return { updatedDimensionList, updatedFilterList };
	};

	updateFilterDimensionList = (
		reportType,
		defaultReportType,
		filterList,
		metricsList,
		hbMetricsList,
		dimensionList
	) => {
		const updatedDimensionList = JSON.parse(JSON.stringify(dimensionList));
		const updatedFilterList = JSON.parse(JSON.stringify(filterList));
		const updatedChartList = JSON.parse(JSON.stringify(hbMetricsList || {}));
		const updatedMetricsList = JSON.parse(JSON.stringify(metricsList || {}));

		/* eslint-disable no-param-reassign */
		if (reportType === 'account' || reportType === 'global') {
			updatedFilterList.forEach(fil => {
				const index = accountFilter.indexOf(fil.value);
				if (index >= 0) {
					fil.isDisabled = false;
				} else fil.isDisabled = true;
			});
			updatedDimensionList.forEach(dim => {
				const index = accountDimension.indexOf(dim.value);
				if (index >= 0) {
					dim.isDisabled = false;
				} else dim.isDisabled = true;
			});
		} else {
			updatedFilterList.forEach(fil => {
				fil.isDisabled = false;
			});
			updatedDimensionList.forEach(dim => {
				dim.isDisabled = false;
			});
		}
		return { updatedFilterList, updatedDimensionList, updatedChartList, updatedMetricsList };
	};

	render() {
		const { state } = this;
		const { reportType, pageSize, pageIndex, recordCount, showAlert } = this.props;
		const currentSet = pageSize * pageIndex;

		return (
			<Fragment>
				<div
					className="aligner aligner--wrap aligner--hSpaceBetween u-margin-t4"
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr 1fr'
					}}
				>
					<div className="aligner-item u-margin-r4">
						{/* eslint-disable */}
						<label className="u-text-normal">Report By</label>
						<SelectBox
							id="report-by"
							key="report-by"
							isClearable={false}
							isSearchable={false}
							wrapperClassName="custom-select-box-wrapper"
							reset={true}
							selected={state.selectedDimension}
							options={state.dimensionList}
							onSelect={this.onReportBySelect}
						/>
						{/* eslint-enable */}
					</div>

					<div className="aligner-item u-margin-r4">
						{/* eslint-disable */}
						<label className="u-text-normal">Interval</label>
						<SelectBox
							id="interval"
							key="interval"
							wrapperClassName="custom-select-box-wrapper"
							isClearable={false}
							isSearchable={false}
							selected={state.selectedInterval}
							options={state.intervalList}
							onSelect={selectedInterval => {
								this.setState({ selectedInterval }, this.onControlChange.bind(null, reportType));
							}}
						/>
						{/* eslint-enable */}
					</div>
					<div className="aligner-item ">
						{/* eslint-disable */}
						<label className="u-text-normal">Date Range</label>
						<PresetDateRangePicker
							presets={getPresets()}
							startDate={state.startDate}
							endDate={state.endDate}
							datesUpdated={({ startDate, endDate }) =>
								this.setState({ startDate, endDate }, this.onControlChange.bind(null, reportType))
							}
							/*
								data prior to 1st Aug, 2019 is present in the old console 
								therefore disabling dates before 1st Aug, 2019
							*/
							isOutsideRange={day =>
								day.isAfter(moment()) ||
								day.isBefore(
									moment()
										.startOf('month')
										.set({ year: 2019, month: 7 })
								)
							}
							autoFocus
						/>
						<div className="updateStatusDiv">{state.updateStatusText}</div>
						{/* eslint-enable */}
					</div>
				</div>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr 1fr'
					}}
				>
					<div className="aligner-item u-margin-r4">
						{/* eslint-disable */}
						<label className="u-text-normal">Order By</label>
						<SelectBox
							id="orderby"
							key="orderby"
							wrapperClassName="custom-select-box-wrapper"
							isClearable={false}
							isSearchable={false}
							selected={state.selectedOrderBy}
							options={state.orderByList}
							onSelect={selectedOrderBy => {
								this.setState({ selectedOrderBy }, this.onControlChange.bind(null, reportType));
							}}
						/>
						{/* eslint-enable */}
					</div>
					<div
						className="aligner-item u-margin-r4"
						style={{
							display: 'flex',
							alignItems: 'flex-end'
						}}
					>
						{/* <div className="aligner-item u-margin-r2 custom-select-box-wrapper custom-select-box-wrapper">
							<label className="u-text-normal">Cut-Off</label>
							<input
								className="form-control"
								type="text"
								placeholder="Cut Off"
								name="cutOffRevenue"
								value={state.cutOffRevenue}
								onChange={e => {
									const { value } = e.target;
									this.setState(
										{ cutOffRevenue: value },
										debounce(this.onDebounceControlChange.bind(null, reportType))
									);
								}}
							/>
						</div> */}
					</div>
					<div
						className="aligner-item aligner--hEnd"
						style={{
							display: 'flex',
							alignItems: 'flex-end'
						}}
					>
						<Button
							className="u-margin-r4"
							bsStyle="primary"
							onClick={this.onGenerateButtonClick}
							disabled={state.disableGenerateButton}
							style={{ width: '100%' }}
						>
							<Glyphicon glyph="cog u-margin-r2" />
							Generate Report
						</Button>
						<CSVLink
							data={state.csvData}
							filename={`${state.fileName}.csv`}
							style={{
								display: 'block',
								paddingTop: 8
							}}
							className="btn btn-lightBg btn-default btn-blue-line"
						>
							<Glyphicon glyph="download-alt  u-margin-r2" />
							Export Report
						</CSVLink>
					</div>
				</div>
				<hr />
				{showAlert ? (
					<Alert bsStyle="info" onDismiss={this.handleDismiss} className="u-margin-t4">
						Due to an internal data migration process, there might be some inconsistencies in the
						UTM reports for the period between <strong>4th October till 9th October.</strong>
					</Alert>
				) : null}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr 1fr',
						paddingBottom: '10px'
					}}
				>
					<div
						className="aligner-item u-margin-r4"
						style={{
							display: 'flex',
							alignItems: 'flex-end'
						}}
					>
						<InputGroup
							style={{
								width: '100%'
							}}
						>
							<InputGroup.Addon>Filter</InputGroup.Addon>
							<input
								className="form-control"
								type="text"
								placeholder="Search"
								name="regexFilter"
								value={state.regexFilter}
								onChange={e => {
									const { value } = e.target;
									this.setState(
										{ regexFilter: value },
										debounce(this.onDebounceControlChange.bind(null, reportType))
									);
								}}
							/>
						</InputGroup>
					</div>
					<div />
					<div
						style={{
							display: 'flex',
							alignItems: 'flex-end',
							justifyContent: 'flex-end'
						}}
					>
						<span>{`${pageSize > 0 ? currentSet + 1 : 0}-${ currentSet + pageSize < recordCount?(currentSet +
							pageSize): recordCount} of ${recordCount} records`}</span>
					</div>
				</div>
			</Fragment>
		);
	}
}

export default Control;
