import React, { Component, Fragment } from 'react';
import { sortBy } from 'lodash';
import { Glyphicon, Button } from 'react-bootstrap';
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import AsyncGroupSelect from '../../../Components/AsyncGroupSelect/index';
import PresetDateRangePicker from '../../../Components/PresetDateRangePicker/index';
import Selectbox from '../../../Components/SelectBox/index';
import { convertObjToArr, getPresets } from '../helpers/utils';
import reportService from '../../../services/reportService';
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
			updateStatusText: ''
		};
	}

	componentDidMount() {
		this.updateFilterList(this.props.reportType);
		this.getReportStatus();
	}

	componentDidUpdate(prevProps) {
		const { selectedDimension, selectedFilters, selectedInterval, startDate, endDate } = this.props;
		if (prevProps.selectedFilters !== selectedFilters) {
			this.setState({ selectedFilters });
		}
		if (prevProps.selectedDimension !== selectedDimension) {
			this.setState({ selectedDimension });
		}
		if (prevProps.selectedInterval !== selectedInterval) {
			this.setState({ selectedInterval });
		}
		if (prevProps.startDate !== startDate) {
			this.setState({ startDate });
		}
		if (prevProps.endDate !== endDate) {
			this.setState({ endDate });
		}
		if (prevProps.reportType !== this.props.reportType) {
			this.updateFilterList(this.props.reportType);
		}
	}

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
		const { reportType } = this.props;
		const { selectedFilters } = this.state;
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

	disableControl = (disabledFilter, disabledDimension, disabledMetrics) => {
		let { dimensionList, filterList, metricsList } = this.state;
		if (disabledFilter && disabledFilter.length > 0) {
			filterList.map(filter => {
				let found = disabledFilter.find(fil => fil === filter.value);
				if (found) filter.isDisabled = true;
			});
		}
		if (disabledDimension && disabledDimension.length > 0) {
			dimensionList.map(dimension => {
				let found = disabledDimension.find(dim => dim === dimension.value);
				if (found) dimension.isDisabled = true;
			});
		}
		if (disabledMetrics && disabledMetrics.length > 0) {
			metricsList.map(metrics => {
				let found = disabledMetrics.find(metric => metric === metrics.value);
				if (found) metrics.isDisabled = true;
			});
		}
		this.setState({ filterList, metricsList, dimensionList });
	};

	onDimensionChange = selectedDimension => {
		let { dimensionList } = this.state;
		let dimensionObj = dimensionList.find(dimension => dimension.value === selectedDimension);
		if (dimensionObj) {
			let disabledFilter = dimensionObj['disabled_filter'];
			let disabledDimension = dimensionObj['disabled_dimension'];
			let disabledMetrics = dimensionObj['disabled_metrics'];
			this.disableControl(disabledFilter, disabledDimension, disabledMetrics);
		}
	};

	onFilterChange = selectedFilters => {
		if (selectedFilters && selectedFilters['siteid']) this.updateFilterList('site');
		this.setState({ selectedFilters });
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

	generateButtonHandler = () => {
		const {
			startDate,
			endDate,
			selectedDimension,
			selectedInterval,
			selectedFilters,
			metricsList
		} = this.state;
		const { generateButtonHandler } = this.props;
		generateButtonHandler({
			startDate,
			endDate,
			selectedDimension,
			selectedFilters,
			selectedInterval,
			metricsList
		});
		// this.setState({
		// 	disableGenerateButton: true
		// });
	};

	render() {
		const { state, props } = this;
		let csvData = btoa(JSON.stringify(props.csvData));
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
								this.onDimensionChange(selectedDimension);
								this.setState({ selectedDimension });
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
								this.setState({ selectedInterval });
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
							datesUpdated={({ startDate, endDate }) => this.setState({ startDate, endDate })}
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
							onFilterValueChange={this.onFilterChange}
							getSelectedFilter={this.getSelectedFilter}
						/>
						{/* eslint-enable */}
					</div>

					<div className="aligner-item u-margin-r4 aligner--hEnd">
						<Button
							bsStyle="primary"
							onClick={this.generateButtonHandler}
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
