import React, { Component, Fragment } from 'react';
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { CSVLink } from 'react-csv';
import isEqual from 'lodash/isEqual';
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';
import Select from 'react-select';

import { Glyphicon, Button } from '@/Client/helpers/react-bootstrap-imports';
import GoogleOAuthLogin from '../../../Components/GoogleOAuthLogin';
import AsyncGroupSelect from '../../../Components/AsyncGroupSelect/index';
import PresetDateRangePicker from '../../../Components/PresetDateRangePicker/index';
import SelectBox from '../../../Components/SelectBox/index';
import Schedule from './Schedule';
import MultiSelectBox from '../../../Components/MultiSelectBox/index';
import { getPresets, getPresetDropdownItems, getPresetsForHB } from '../helpers/utils';
import reportService from '../../../services/reportService';
import {
	accountFilter,
	accountDimension,
	opsDimension,
	opsFilter,
	displayHBCharts,
	extraMetricsListMappingForHB
} from '../configs/commonConsts';
import {
	getReportingControlDemoUserSites,
	getReportingDemoUserSiteIds
} from '../../../helpers/commonFunctions';

class Control extends Component {
	constructor(props) {
		super(props);

		const selectedMetrics = props.isHB ? props.selectedMetrics : [];
		let { metricsList } = props;
		const {
			dimensionList,
			filterList,
			displayHBMetrics,
			selectedCharts,
			hbMetricsList,
			intervalList,
			startDate,
			endDate,
			reportType,
			selectedDimension,
			selectedInterval,
			selectedFilters,
			csvData
		} = props;

		// eslint-disable-next-line array-callback-return
		metricsList = metricsList.map(metrics => {
			if (extraMetricsListMappingForHB[metrics.value]) {
				// eslint-disable-next-line no-param-reassign
				metrics.name = extraMetricsListMappingForHB[metrics.value].display_name;
			}
			return metrics;
		});

		this.state = {
			dimensionList,
			filterList,
			metricsList,
			// eslint-disable-next-line react/no-unused-state
			displayHBMetrics,
			displayHBCharts,
			selectedMetrics,
			selectedCharts,
			chartList: hbMetricsList,
			intervalList,
			startDate,
			endDate,
			reportType,
			selectedDimension: selectedDimension || [],
			selectedInterval: selectedInterval || '',
			selectedFilters: selectedFilters || {},
			disableGenerateButton: false,
			updateStatusText: '',
			selectedFilterKey: null,
			selectedFilterValues: null,
			csvData,
			fileName: 'adpushup-report',
			isLoading: false
		};
		this.onMetricsListChange = this.onMetricsListChange.bind(this);
		this.onChartListChange = this.onChartListChange.bind(this);
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
		const updateIntervalList = !isEqual(currState.intervalList, nextProps.intervalList);

		const newState = {};
		newState.chartList = currState.chartList;
		if (isCsvData) newState.csvData = nextProps.csvData;
		if (updateDimensionList) newState.dimensionList = nextProps.dimensionList;
		if (updateFilterList) newState.filterList = nextProps.filterList;
		if (updateMetricsList) newState.metricsList = nextProps.metricsList;
		if (updateIntervalList) newState.intervalList = nextProps.intervalList;

		this.setState(newState);
	}

	onReportBySelect = selectedDimensions => {
		const { reportType, isHB } = this.props;
		// eslint-disable-next-line no-nested-ternary
		const updatedSelectedDimension = selectedDimensions
			? isHB
				? selectedDimensions
				: [...selectedDimensions]
			: [];
		this.setState(
			{ selectedDimension: updatedSelectedDimension },
			this.onControlChange.bind(null, reportType)
		);
	};

	onFilteChange = (selectedFilters, selectedFilterValues, selectedFilterKey) => {
		const { defaultReportType } = this.props;
		let reportType = defaultReportType || 'account';
		const { filterList, dimensionList, hbMetricsList, metricsList, selectedDimension } = this.props;
		const selectedSiteFilters = selectedFilters.siteid || {};
		if (selectedSiteFilters && Object.keys(selectedSiteFilters).length === 1) {
			reportType = 'site';
		}

		const {
			updatedFilterList,
			updatedDimensionList,
			updatedMetricsList,
			updatedChartList,
			updatedSelectedDimension
		} = this.updateFilterDimensionList(
			reportType,
			selectedDimension,
			filterList,
			metricsList,
			hbMetricsList,
			dimensionList
		);
		this.setState(
			{
				dimensionList: updatedDimensionList,
				filterList: updatedFilterList,
				selectedFilterKey,
				selectedFilterValues,
				metricsList: updatedMetricsList,
				chartList: updatedChartList,
				reportType,
				selectedDimension: updatedSelectedDimension
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

	onControlChange = (reportType, resetSavedReport = true) => {
		const resultObject = this.getStateParams();
		const { onControlChange } = this.props;
		onControlChange(resultObject, reportType, resetSavedReport);
	};

	onGenerateButtonClick = () => {
		const resultObject = this.getStateParams();
		const { generateButtonHandler } = this.props;
		generateButtonHandler(resultObject);
	};

	getStateParams = () => {
		const {
			startDate,
			endDate,
			selectedInterval,
			selectedDimension,
			selectedFilters,
			selectedFilterKey,
			selectedFilterValues,
			selectedMetrics,
			selectedCharts,
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
			reportType
		};

		if (selectedFilterKey && selectedFilterValues) {
			resultObject.selectedFilterKey = selectedFilterKey;
			resultObject.selectedFilterValues = selectedFilterValues;
		}

		return resultObject;
	};

	getSelectedFilter = filter => {
		const {
			reportType,
			defaultReportType,
			selectedFilters,
			isDemoUser,
			associatedSites
		} = this.props;

		let siteIds = [];
		let isSuperUser = false;
		const selectedSiteIds = selectedFilters.siteid && Object.keys(selectedFilters.siteid);

		const {
			userSites,
			user: {
				data: { email }
			}
		} = this.props;
		if (defaultReportType !== 'global' && filter.value === 'siteid') {
			siteIds = Object.keys(userSites);
			siteIds = getReportingDemoUserSiteIds(siteIds, email, reportType, true);
		} else if (defaultReportType === 'global' && filter.value === 'siteid') {
			isSuperUser = true;
			if (associatedSites.length) {
				siteIds = [...Object.keys(userSites), ...associatedSites].join(',');
			}
		} else if (reportType === 'account') {
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
		const { showReportingDelayPopup } = this.props;
		reportService.getLastUpdateStatus().then(res => {
			if (res.status === 200 && res.data) {
				const { lastRunOn: updatedTimeStamp, lastRunTimePST: updatedDate } = res.data;
				const diffTime = moment.duration(moment().diff(moment(updatedTimeStamp)));
				const delayHours = diffTime.asHours();
				showReportingDelayPopup(delayHours);
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
		selectedDimension,
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
		// Why we have this condition
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
		const { isHB } = this.props;
		const updatedSelectedDimension = isHB
			? selectedDimension
			: selectedDimension.filter(dimension => {
					for (let i = 0; i < updatedDimensionList.length; i++) {
						const currentDimension = updatedDimensionList[i];
						if (currentDimension.value === dimension) return !currentDimension.isDisabled;
					}
					return false;
			  });
		return {
			updatedFilterList,
			updatedDimensionList,
			updatedChartList,
			updatedMetricsList,
			updatedSelectedDimension
		};
	};

	handleInputChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	onSavedReportSelect = (selectedReport, { action }) => {
		const { reportType, setSelectedReport } = this.props;
		if (action === 'select-option' && selectedReport) {
			this.setState(
				{
					startDate: selectedReport.startDate,
					endDate: selectedReport.endDate,
					selectedInterval: selectedReport.selectedInterval,
					// need to check this
					// Saved Report may have dimension saved as string instead of Array
					selectedDimension:
						selectedReport.selectedDimension instanceof Array
							? selectedReport.selectedDimension
							: [selectedReport.selectedDimension] || [],
					// selectedDimension: selectedReport.selectedDimension,
					selectedFilters: cloneDeep(selectedReport.selectedFilters)
				},
				() => {
					const callback = () => this.onControlChange(reportType, false);
					setSelectedReport(selectedReport, callback);
				}
			);
		} else if (action === 'clear') {
			this.setState(
				{
					startDate: moment()
						.startOf('day')
						.subtract(7, 'days')
						.format('YYYY-MM-DD'),
					endDate: moment()
						.startOf('day')
						.subtract(1, 'day')
						.format('YYYY-MM-DD'),
					selectedInterval: 'daily',
					selectedDimension: [],
					selectedFilters: {}
				},
				() => this.onControlChange(reportType, true)
			);
		}
	};

	formatGroupLabel = group => (
		<div className="select-options-group">
			<span className="name">{group.label}</span>
			<span className="count">{group.options.length}</span>
		</div>
	);

	getSelectedControlsForCSVColumns = () => {
		const { startDate, endDate, selectedDimension = [], selectedInterval } = this.state;
		const { selectedFilterValues = {} } = this.props;
		// HB gives single dimension and type is string
		const dimensions = Array.isArray(selectedDimension)
			? selectedDimension.join(',')
			: selectedDimension;
		// Add empty strings for formatting - leave a blank cell
		const csvInfo = [
			['Start Date', startDate],
			['End Date', endDate],
			['Dimension', dimensions || 'N/A'],
			['Interval', selectedInterval]
		];

		const filters = [['Filters', 'Filters Value']];
		const isAnyFilterApplied = !!Object.keys(selectedFilterValues).length;
		if (isAnyFilterApplied) {
			const selectedFilterKeys = Object.keys(selectedFilterValues);
			selectedFilterKeys.forEach(filterType => {
				const filterValues = selectedFilterValues[filterType];
				filters.push([
					filterValues.length ? filterType : '',
					filterValues.map(filter => filter.value).join(', ')
				]);
			});
		} else {
			filters.push(['N/A', 'N/A']);
		}

		filters.forEach((filter, index) => {
			// exclude - heading of filters
			if (csvInfo[index]) {
				csvInfo[index] = [...csvInfo[index], '', ...filter];
			} else {
				csvInfo.push(['', '', '', ...filter]);
			}
		});
		csvInfo.push([]);
		return csvInfo;
	};

	render() {
		const { state } = this;
		const {
			reportType,
			showNotification,
			selectedReport,
			savedReports = [],
			frequentReports = [],
			onReportSave,
			onReportUpdate,
			onReportDelete,
			selectedReportName,
			updateReportName,
			isHB,
			filterList,
			user: { data: { isSuperUser = false } = {} } = {}
		} = this.props;
		const { scheduleOptions: { startDate, endDate, interval } = {}, type: selectedReportType } =
			selectedReport || {};
		const selectedReportStartDate = startDate;
		const selectedReportEndDate = endDate;
		const isUpdating = selectedReport !== null;
		const isSavedReportsEmpty = savedReports.length === 0 && frequentReports.length === 0;
		const { selectedDimension = [], csvData } = state;
		const savedAndFrequentReportOptions = [
			{ label: 'Saved Reports', value: 'savedReports', options: savedReports },
			{ label: 'Frequent Reports', value: 'frequentReports', options: frequentReports }
		];
		const allSelectedDimensionsNames =
			(!isHB &&
				selectedDimension.map(value => {
					let dimensionName = '';
					// eslint-disable-next-line no-restricted-syntax
					for (const filter of filterList) {
						if (filter.value === value) {
							dimensionName = filter.name;
						}
					}
					return dimensionName;
				})) ||
			[];
		let multiSelectBoxMessage = allSelectedDimensionsNames.join(', ');
		let isFadeout = false;
		const multiSelectBoxWidth =
			(document.getElementById('report-by') && document.getElementById('report-by').offsetWidth) ||
			0;
		if (multiSelectBoxMessage.length > multiSelectBoxWidth / 8) {
			isFadeout = true;
			multiSelectBoxMessage = `${multiSelectBoxMessage.slice(0, multiSelectBoxWidth / 8)}...`;
		}

		return (
			<Fragment>
				{!isSavedReportsEmpty && (
					<div className="aligner aligner--wrap aligner--hSpaceBetween u-margin-t4">
						<label className="u-text-normal">Saved and Frequent Reports</label>
						<Select
							onChange={this.onSavedReportSelect}
							options={savedAndFrequentReportOptions}
							selected={selectedReport ? selectedReport.value : null}
							isSearchable
							isClearable
							className="saved-reports-select custom-select-box-wrapper"
							formatGroupLabel={this.formatGroupLabel}
						/>
					</div>
				)}
				<div className="aligner aligner--wrap aligner--hSpaceBetween u-margin-t4">
					<div className="aligner-item u-margin-r4">
						{/* eslint-disable */}
						<label className="u-text-normal">Report By</label>
						{/* <SelectBox
								id="report-by"
								key="report-by"
								isClearable={false}
								isSearchable={false}
								wrapperClassName="custom-select-box-wrapper"
								reset={true}
								selected={state.selectedDimension}
								options={state.dimensionList}
								onSelect={this.onReportBySelect}
							/> */}
						{!isHB ? (
							<MultiSelectBox
								id="report-by"
								key="report-by"
								wrapperClassName="custom-select-box-wrapper"
								isClearable={false}
								isSearchable={false}
								isMainReportingPanel={true}
								selected={state.selectedDimension}
								options={state.dimensionList || []}
								isFadeout={isFadeout}
								multiSelectBoxMessage={multiSelectBoxMessage}
								onSelect={selectedDimensions => {
									this.onReportBySelect(selectedDimensions);
								}}
								defaultMessage="Select Value"
							/>
						) : (
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
						)}

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
						<label className="u-text-normal">
							Date Range {isHB ? '(Max 30 days can be selected)' : ''}
						</label>
						<PresetDateRangePicker
							presets={isHB ? getPresetsForHB() : getPresets()}
							getPresetDropdownItems={isHB ? [] : getPresetDropdownItems()}
							startDate={state.startDate}
							endDate={state.endDate}
							datesUpdated={({ startDate, endDate }) => {
								if (isHB) {
									const dateDiff = moment(endDate).diff(startDate, 'days');
									if (!isNaN(dateDiff) && dateDiff <= 30) {
										this.setState(
											{ startDate, endDate },
											this.onControlChange.bind(null, reportType)
										);
									} else {
										this.setState(
											{ startDate, endDate: '' },
											this.onControlChange.bind(null, reportType)
										);
									}
								} else {
									this.setState(
										{ startDate, endDate },
										this.onControlChange.bind(null, reportType)
									);
								}
							}}
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
				{isHB ? (
					<div
						className="aligner aligner--wrap aligner--hSpaceBetween"
						style={{ marginTop: '1rem !important' }}
					>
						<div className="chart-selectorBox aligner-item aligner-item--grow5 u-margin-r4">
							<div className="aligner-item u-margin-r4">
								<label className="u-text-normal">Select Chart</label>
								<MultiSelectBox
									id="chartList"
									key="chartList"
									wrapperClassName="custom-select-box-wrapper"
									isClearable={false}
									isSearchable={false}
									selected={state.selectedCharts}
									options={state.displayHBCharts || []}
									onSelect={selectedCharts => {
										this.setState({ selectedCharts }, this.onControlChange.bind(null, reportType));
									}}
								/>
								{/* eslint-enable */}
							</div>
						</div>
						<div className="chart-selectorBox aligner-item aligner-item--grow5 u-margin-r4">
							<div className="aligner-item u-margin-r4">
								<label className="u-text-normal">Select Metrics</label>
								<MultiSelectBox
									id="metricsList"
									key="metricsList"
									wrapperClassName="custom-select-box-wrapper"
									isClearable={false}
									isSearchable={false}
									selected={state.selectedMetrics}
									options={state.metricsList || []}
									onSelect={selectedMetrics => {
										this.onMetricsListChange(selectedMetrics);
										// this.setState({ selectedMetrics }, this.onControlChange.bind(null, reportType));
									}}
								/>
								{/* eslint-enable */}
							</div>
						</div>
					</div>
				) : (
					''
				)}
				<div className="aligner aligner--wrap aligner--hSpaceBetween  u-margin-t4 filterAndGenerateButtonRow">
					<div className="reporting-filterBox aligner-item aligner-item--grow5 u-margin-r4">
						{/* eslint-disable */}
						<AsyncGroupSelect
							key="filter list"
							filterList={state.filterList}
							selectedFilters={state.selectedFilters}
							onFilterValueChange={this.onFilteChange}
							getSelectedFilter={this.getSelectedFilter}
							showNotification={showNotification}
						/>
						{/* eslint-enable */}
					</div>
					<div className="aligner-item u-margin-r4 aligner--hEnd">
						<Button
							bsStyle="primary"
							onClick={this.onGenerateButtonClick}
							disabled={state.disableGenerateButton}
						>
							<Glyphicon glyph="cog u-margin-r2" />
							Generate Report
						</Button>
					</div>

					<div className="aligner-item u-margin-r2">
						<CSVLink
							data={state.csvData}
							filename={`${state.fileName}.csv`}
							style={{
								display: 'block',
								paddingTop: 8
							}}
							className="btn btn-lightBg btn-default btn-blue-line"
						>
							<Glyphicon glyph="download-alt u-margin-r2" />
							Export Report
						</CSVLink>
					</div>

					{isSuperUser && (
						<div className="aligner-item u-margin-r2">
							<GoogleOAuthLogin
								type="button"
								variant="secondary"
								className="pull-right gs-btn"
								showSpinner={state.isLoading}
								selectedControlsForCSV={this.getSelectedControlsForCSVColumns()}
								csvData={csvData}
								// disabled={!hasUnsavedChanges}
							>
								Export To Google Sheet
							</GoogleOAuthLogin>
						</div>
					)}
				</div>
				{isHB || selectedReportType === 'frequentReport' ? null : (
					<Schedule
						name={selectedReportName}
						startDate={selectedReportStartDate}
						endDate={selectedReportEndDate}
						reportInterval={interval}
						isUpdating={isUpdating}
						onReportSave={onReportSave}
						onReportUpdate={onReportUpdate}
						showNotification={showNotification}
						onReportDelete={onReportDelete}
						updateReportName={updateReportName}
					/>
				)}
			</Fragment>
		);
	}
}

export default Control;
