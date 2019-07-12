import React, { Component, Fragment } from 'react';
import { sortBy, isEmpty, union } from 'lodash';
import { Glyphicon, Button } from 'react-bootstrap';
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import AsyncGroupSelect from '../../../Components/AsyncGroupSelect/index';
import PresetDateRangePicker from '../../../Components/PresetDateRangePicker/index';
import Selectbox from '../../../Components/Selectbox/index';
import { convertObjToArr, getPresets } from '../helpers/utils';
import reportService from '../../../services/reportService';
import { displayMetrics } from '../configs/commonConsts';
import { accountFilter, REPORT_DOWNLOAD_ENDPOINT } from '../configs/commonConsts';

class Control extends Component {
	constructor(props) {
		super(props);

		this.state = {
			dimensionList: props.dimensionList,
			filterList: props.filterList,
			intervalList: props.intervalList,
			metricsList: props.metricsList,
			startDate: props.startDate,
			endDate: props.endDate,
			reportType: props.reportType,
			selectedDimension: props.selectedDimension || '',
			selectedInterval: props.selectedInterval || '',
			selectedFilters: props.selectedFilters || {},
			disableGenerateButton: false,
			updateStatusText: '',
			csvData: props.csvData
		};
	}

	componentDidMount() {
		//this.updateFilterList(this.props.reportType);
		this.getReportStatus();
	}

	shouldComponentUpdate() {
		return false;
	}

	onControlChange = () => {
		let {
			startDate,
			endDate,
			selectedInterval,
			selectedDimension,
			selectedFilters,
			reportType
		} = this.state;
		this.props.onControlChange({
			startDate,
			endDate,
			selectedInterval,
			selectedDimension,
			selectedFilters,
			reportType
		});
	};

	updateFilterList = reportType => {
		const { filter } = this.props;
		let { filterList } = this.state;
		if (reportType === 'account') {
			let updatedFilterList = [];
			for (let fil in filter) {
				let index = accountFilter.indexOf(fil);
				if (index >= 0) {
					updatedFilterList.push(filter[fil]);
				}
			}
			updatedFilterList = sortBy(updatedFilterList, filter => filter.position);

			filterList = updatedFilterList;
		} else {
			filterList = convertObjToArr(filter);
		}
		this.setState({ filterList });
	};

	getSelectedFilter = filter => {
		const { reportType, selectedFilters } = this.props;
		let siteIds;
		if (reportType === 'account') {
			const { site } = this.props;
			siteIds = Object.keys(site);
		} else {
			siteIds = selectedFilters['siteid'] ? Object.keys(selectedFilters['siteid']) : [];
		}
		const params = { siteid: siteIds.toString() };
		return reportService.getWidgetData({ path: filter.path, params });
	};

	getReportStatus() {
		reportService.getLastUpdateStatus().then(res => {
			if (res.status == 200 && res.data) {
				let updatedDate = res.data.lastRunTimePST;
				this.setState({
					updateStatusText: `Last updated on ${updatedDate}.`
				});
			}
		});
	}

	render() {
		const { state } = this;
		let csvData = btoa(JSON.stringify(state.csvData));
		const downloadLink = `${REPORT_DOWNLOAD_ENDPOINT}?data=${csvData}`;
		return (
			<Fragment>
				<div className="aligner aligner--wrap aligner--hSpaceBetween u-margin-t4">
					<div className="aligner-item u-margin-r4">
						{/* eslint-disable */}
						<label className="u-text-normal">Report By</label>
						<Selectbox
							id="report-by"
							isClearable={false}
							isSearchable={false}
							reset={true}
							selected={state.selectedDimension || ''}
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
						<Selectbox
							id="interval"
							reset={true}
							isClearable={false}
							isSearchable={false}
							selected={state.selectedInterval || ''}
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
							filterList={state.filterList}
							selectedFilters={state.selectedFilters}
							onFilterValueChange={selectedFilters => {
								this.setState({ selectedFilters }, this.onControlChange);
							}}
							getSelectedFilter={this.getSelectedFilter}
						/>
						{/* eslint-enable */}
					</div>

					<div className="aligner-item u-margin-r4 aligner--hEnd">
						<Button
							bsStyle="primary"
							onClick={this.props.generateButtonHandler}
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
						{/* <Button onClick={this.generateButtonHandler} disabled={state.disableGenerateButton}>
							<Glyphicon glyph="download-alt u-margin-r2" />
							Export Report
						</Button> */}
					</div>
				</div>
			</Fragment>
		);
	}
}

export default Control;
