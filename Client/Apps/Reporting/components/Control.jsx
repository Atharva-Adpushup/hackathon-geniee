import React, { Component, Fragment } from 'react';
import { Glyphicon, Button } from '@/Client/helpers/react-bootstrap-imports';
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { CSVLink } from 'react-csv';
import isEqual from 'lodash/isEqual';
import moment from 'moment';
import AsyncGroupSelect from '../../../Components/AsyncGroupSelect/index';
import PresetDateRangePicker from '../../../Components/PresetDateRangePicker/index';
import SelectBox from '../../../Components/SelectBox/index';
import { getPresets } from '../helpers/utils';
import reportService from '../../../services/reportService';
import { accountFilter, accountDimension, opsDimension, opsFilter } from '../configs/commonConsts';
import {
	getReportingControlDemoUserSites,
	getReportingDemoUserSiteIds
} from '../../../helpers/commonFunctions';

class Control extends Component {
	constructor(props) {
		super(props);
		// const { updatedDimensionList, updatedFilterList } = this.updateFilterDimensionList(
		// 	props.reportType,
		// 	props.filterList,
		// 	props.dimensionList
		// );
		this.state = {
			dimensionList: props.dimensionList,
			filterList: props.filterList,
			intervalList: props.intervalList,
			startDate: props.startDate,
			endDate: props.endDate,
			reportType: props.reportType,
			selectedDimension: props.selectedDimension || '',
			selectedInterval: props.selectedInterval || '',
			selectedFilters: props.selectedFilters || {},
			disableGenerateButton: false,
			updateStatusText: '',
			csvData: props.csvData,
			fileName: 'adpushup-report'
		};
	}

	componentDidMount() {
		this.getReportStatus();
	}

	componentWillReceiveProps(nextProps) {
		const { state: currState } = this;
		const isCsvData = !!(nextProps && nextProps.csvData);
		const updateDimensionList = !isEqual(currState.dimensionList, nextProps.dimensionList);
		const updateFilterList = !isEqual(currState.filterList, nextProps.filterList);

		const newState = {};

		if (isCsvData) newState.csvData = nextProps.csvData;
		if (updateDimensionList) newState.dimensionList = nextProps.dimensionList;
		if (updateFilterList) newState.filterList = nextProps.filterList;

		this.setState(newState);
	}

	onReportBySelect = selectedDimension => {
		const { reportType } = this.props;
		this.setState({ selectedDimension }, this.onControlChange.bind(null, reportType));
	};

	onFilteChange = selectedFilters => {
		const { defaultReportType } = this.props;
		let reportType = defaultReportType || 'account';
		const { filterList, dimensionList } = this.props;
		const selectedSiteFilters = selectedFilters.siteid || {};
		if (selectedSiteFilters && Object.keys(selectedSiteFilters).length === 1) {
			reportType = 'site';
		}
		const { updatedFilterList, updatedDimensionList } = this.updateFilterDimensionList(
			reportType,
			defaultReportType,
			filterList,
			dimensionList
		);
		this.setState(
			{
				dimensionList: updatedDimensionList,
				filterList: updatedFilterList,
				reportType
			},
			() => this.onControlChange(reportType)
		);
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

	getStateParams = () => {
		const {
			startDate,
			endDate,
			selectedInterval,
			selectedDimension,
			selectedFilters,
			reportType
		} = this.state;
		const resultObject = {
			startDate,
			endDate,
			selectedInterval,
			selectedDimension,
			selectedFilters,
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
			if (res.status == 200 && res.data) {
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

	updateFilterDimensionList = (reportType, defaultReportType, filterList, dimensionList) => {
		const updatedDimensionList = JSON.parse(JSON.stringify(dimensionList));
		const updatedFilterList = JSON.parse(JSON.stringify(filterList));

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
		return { updatedFilterList, updatedDimensionList };
	};

	render() {
		const { state } = this;
		const { reportType } = this.props;

		return (
			<Fragment>
				<div className="aligner aligner--wrap aligner--hSpaceBetween u-margin-t4">
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
				<div className="aligner aligner--wrap aligner--hSpaceBetween u-margin-t4">
					<div className="reporting-filterBox aligner-item aligner-item--grow5 u-margin-r4">
						{/* eslint-disable */}
						<AsyncGroupSelect
							key="filter list"
							filterList={state.filterList}
							selectedFilters={state.selectedFilters}
							onFilterValueChange={this.onFilteChange}
							getSelectedFilter={this.getSelectedFilter}
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
					<div className="aligner-item ">
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
				</div>
			</Fragment>
		);
	}
}

export default Control;
