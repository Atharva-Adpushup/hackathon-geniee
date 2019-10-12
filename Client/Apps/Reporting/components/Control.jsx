import React, { Component, Fragment } from 'react';
import { Glyphicon, Button } from 'react-bootstrap';
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import AsyncGroupSelect from '../../../Components/AsyncGroupSelect/index';
import PresetDateRangePicker from '../../../Components/PresetDateRangePicker/index';
import SelectBox from '../../../Components/SelectBox/index';
import { getPresets } from '../helpers/utils';
import reportService from '../../../services/reportService';
import {
	accountFilter,
	accountDimension,
	opsDimension,
	opsFilter,
	REPORT_DOWNLOAD_ENDPOINT
} from '../configs/commonConsts';
import { getReportingControlDemoUserSites } from '../../../helpers/commonFunctions';

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
		const isValidNextProps = !!(nextProps && nextProps.csvData);

		if (isValidNextProps) {
			this.setState({ csvData: nextProps.csvData });
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		return (
			this.state.reportType !== nextState.reportType ||
			this.state.updateStatusText !== nextState.updateStatusText
		);
	}

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
			filterList,
			dimensionList
		);
		this.setState(
			{
				dimensionList: updatedDimensionList,
				filterList: updatedFilterList,
				reportType
			},
			this.onControlChange
		);
	};

	onControlChange = () => {
		const resultObject = this.getStateParams();
		const { onControlChange } = this.props;

		onControlChange(resultObject);
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
		const { reportType, selectedFilters, isDemoUser } = this.props;
		let siteIds;
		let isSuperUser = false;

		if (reportType === 'account') {
			const { site } = this.props;
			siteIds = Object.keys(site);

		} else if (reportType === 'global') {
			siteIds = '';
			isSuperUser = true;
		} else {
			siteIds = selectedFilters.siteid ? Object.keys(selectedFilters.siteid) : [];
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

	updateFilterDimensionList = (reportType, filterList, dimensionList) => {
		const { updatedDimensionList, updatedFilterList } = this.removeOpsFilterDimension(
			filterList,
			dimensionList
		);
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
		const csvData = btoa(JSON.stringify(state.csvData));
		const downloadLink = `${REPORT_DOWNLOAD_ENDPOINT}?data=${csvData}&fileName=${state.fileName}`;
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
							onSelect={selectedDimension => {
								this.setState({ selectedDimension }, this.onControlChange);
							}}
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
								this.setState({ selectedInterval }, this.onControlChange);
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
								this.setState({ startDate, endDate }, this.onControlChange)
							}
							autoFocus
						/>
						<div className="updateStatusDiv">{state.updateStatusText}</div>
						{/* eslint-enable */}
					</div>
				</div>
				<div className="aligner aligner--wrap aligner--hSpaceBetween u-margin-t4">
					<div className="aligner-item aligner-item--grow5 u-margin-r4">
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
						<a
							href={downloadLink}
							style={{
								display: 'block',
								height: 33,
								paddingTop: 8
							}}
							className="btn btn-lightBg btn-default btn-blue-line"
						>
							<Glyphicon glyph="download-alt u-margin-r2" />
							Export Report
						</a>
					</div>
				</div>
			</Fragment>
		);
	}
}

export default Control;
