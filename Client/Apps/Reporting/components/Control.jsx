import React, { Component, Fragment } from 'react';
import { sortBy } from 'lodash';
import { Glyphicon, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import moment from 'moment';
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import AsyncGroupSelect from '../../../Components/AsyncGroupSelect/index';
import PresetDateRangePicker from '../../../Components/PresetDateRangePicker/index';
import Selectbox from '../../../Components/Selectbox/index';
import { convertObjToArr, arrayUnique, getPresets } from '../helpers/utils';
import reportService from '../../../services/reportService';
import { accountFilter, REPORT_DOWNLOAD_ENDPOINT } from '../configs/commonConsts';

class Control extends Component {
	constructor(props) {
		super(props);
		const dimension = Object.assign({}, props.dimension);

		this.state = {
			dimensionList: convertObjToArr(dimension),
			filterList: convertObjToArr(props.filter),
			intervalList: convertObjToArr(props.interval),
			metricsList: props.metricsList,
			startDate: props.startDate,
			endDate: props.endDate,
			selectedDimension: props.selectedDimension || '',
			selectedInterval: props.selectedInterval || '',
			selectedMetrics: props.selectedMetrics,
			selectedFilters: props.selectedFilters || {},
			disableGenerateButton: false
		};
	}

	componentDidMount() {
		const { reportType, filter } = this.props;
		if (reportType === 'account') {
			let updatedFilterList = [];
			for (let fil in filter) {
				let index = accountFilter.indexOf(fil);
				if (index >= 0) {
					updatedFilterList.push(filter[fil]);
				}
			}
			updatedFilterList = sortBy(updatedFilterList, filter => filter.position);

			this.setState({ filterList: updatedFilterList });
		} else {
			this.setState({ filterList: convertObjToArr(filter) });
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.selectedFilters !== this.props.selectedFilters) {
			this.setState({ selectedFilters: this.props.selectedFilters });
		}
		if (prevProps.reportType !== this.props.reportType) {
			const { reportType, filter } = this.props;
			if (reportType === 'account') {
				let updatedFilterList = [];
				for (let fil in filter) {
					let index = accountFilter.indexOf(fil);
					if (index >= 0) {
						updatedFilterList.push(filter[fil]);
					}
				}
				updatedFilterList = sortBy(updatedFilterList, filter => filter.position);
				this.setState({ filterList: updatedFilterList });
			} else {
				this.setState({ filterList: convertObjToArr(filter) });
			}
		}
	}

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

	onFilterChange = selectedFilters => {
		let { filterList } = this.state;
		let selectedFilterKeys = selectedFilters ? Object.keys(selectedFilters) : [];
		let filterObj;
		let disabledFilter = [];
		let disabledDimension = [];
		let disabledMetrics = [];
		selectedFilterKeys.map(key => {
			let found = filterList.find(filter => filter.value === key);
			if (found) {
				if (!filterObj) {
					filterObj = { ...found };
					disabledFilter = filterObj['disabled_filter'] || [];
					disabledDimension = filterObj['disabled_dimension'] || [];
					disabledMetrics = filterObj['disabled_metrics'] || [];
				} else {
					disabledFilter = found['disabled_filter']
						? arrayUnique(disabledFilter.concat(found['disabled_filter']))
						: disabledFilter;
					disabledDimension = found['disabled_dimension']
						? arrayUnique(disabledDimension.concat(found['disabled_dimension']))
						: disabledDimension;
					disabledMetrics = found['disabled_metrics']
						? arrayUnique(disabledMetrics.concat(found['disabled_metrics']))
						: disabledMetrics;
				}
			}
		});

		this.disableControl(disabledFilter, disabledDimension, disabledMetrics);
		this.setState({ selectedFilters });
	};

	onDimensionChange = selectedDimension => {
		let { dimensionList } = this.state;
		let dimensionObj = dimensionList.find(dimension => dimension.value === selectedDimension);
		let disabledFilter = dimensionObj['disabled_filter'];
		let disabledDimension = dimensionObj['disabled_dimension'];
		let disabledMetrics = dimensionObj['disabled_metrics'];
		this.disableControl(disabledFilter, disabledDimension, disabledMetrics);
		this.setState({ selectedDimension });
	};

	datesUpdated = ({ startDate, endDate }) => {
		this.setState({ startDate, endDate });
	};

	generateButtonHandler = () => {
		const {
			startDate,
			endDate,
			selectedDimension,
			selectedInterval,
			selectedFilters,
			selectedMetrics,
			metricsList
		} = this.state;
		const { generateButtonHandler } = this.props;
		generateButtonHandler({
			startDate,
			endDate,
			selectedDimension,
			selectedFilters,
			selectedMetrics,
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
							selected={state.selectedDimension || ''}
							options={state.dimensionList}
							onSelect={this.onDimensionChange}
						/>
						{/* eslint-enable */}
					</div>

					<div className="aligner-item u-margin-r4">
						{/* eslint-disable */}
						<label className="u-text-normal">Interval</label>
						<Selectbox
							id="interval"
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
							datesUpdated={this.datesUpdated}
							autoFocus
						/>
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
