import React, { Component, Fragment } from 'react';
import { Glyphicon, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import moment from 'moment';
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import AsyncGroupSelect from '../../../Components/AsyncGroupSelect/index';
import PresetDateRangePicker from '../../../Components/PresetDateRangePicker/index';
import Selectbox from '../../../Components/Selectbox/index';
import { dimensions, filters, filtersValues } from '../configs/commonConsts';
import { convertObjToArr } from '../helpers/utils';

class Control extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dimensionList: convertObjToArr(dimensions),
			filterList: convertObjToArr(filters),
			metricsList: [
				{ value: 'Overview', isSelected: true },
				{ value: 'Layout Editor', isDisabled: true },
				{ value: 'AP Tag', isDisabled: true },
				{ value: 'Innovative Ads', isDisabled: true },
				{ value: 'Mediation', isDisabled: true },
				{ value: 'Header Bidding', isDisabled: true },
				{ value: 'AMP', isDisabled: true },
				{ value: 'AdRecover', isDisabled: true }
			],
			startDate: props.startDate,
			endDate: props.endDate,
			selectedDimension: props.selectedDimension || '',
			selectedMetrics: props.selectedMetrics,
			selectedFilters: props.selectedFilters || {},
			disableGenerateButton: false
		};
	}

	// focusUpdated(focusedInput) {
	// 	this.setState({ focusedInput });
	// }

	onMetricsChange(metric) {
		const { selectedMetrics } = this.state;

		const metricsIndex = selectedMetrics.indexOf(metric);
		if (metricsIndex !== -1) selectedMetrics.splice(metricsIndex, 1);
		else selectedMetrics.push(metric);
		this.setState({ selectedMetrics });
	}

	formatFilterAndDimensionList = () => {
		const { dimensionList, filterList } = this.state;
		const filteredDimensions = Object.keys(dimensionList).map(dimension => ({
			value: dimension,
			name: dimensionList[dimension].display_name,
			isDisabled: dimensionList[dimension].isDisabled,
			position: dimensionList[dimension].position
		}));

		const filteredDimensionList = filteredDimensions.sort((a, b) => a.position - b.position);

		const mappedFilters = Object.keys(filterList).map(filter => ({
			value: filter,
			name: filterList[filter].display_name,
			path: filterList[filter].path,
			isDisabled: filterList[filter].isDisabled,
			position: filterList[filter].position
		}));

		const mappedFilterList = mappedFilters.sort((a, b) => a.position - b.position);
		this.setState({ dimensionList: filteredDimensionList, filterList: mappedFilterList });
	};

	getSelectedFilter = filter =>
		// ajax({
		// 	method: 'GET',
		// 	url: `http://staging.adpushup.com/CentralReportingWebService${filter.path}`
		// }).then(res => {
		// 	return res.data.result;
		// });
		filtersValues[filter.value];

	onFilterValueChange = selectedFilters => {
		this.setState({ selectedFilters });
	};

	datesUpdated({ startDate, endDate }) {
		this.setState({ startDate, endDate });
	}

	removeDimension(index) {
		const { selectedDimensions } = this.state;
		selectedDimensions.splice(index, 1);
		this.setState({
			selectedDimensions
		});
	}

	addNewDimension() {
		const { selectedDimensions } = this.state;
		selectedDimensions.push({});
		this.setState({
			selectedDimensions
		});
	}

	generateButtonHandler() {
		const { startDate, endDate, selectedDimensions, selectedFilters, selectedMetrics } = this.state;
		const { generateButtonHandler } = this.props;
		generateButtonHandler({
			startDate,
			endDate,
			selectedDimensions,
			selectedFilters,
			selectedMetrics
		});
		this.setState({
			disableGenerateButton: true
		});
	}

	render() {
		const tooltip = <Tooltip id="tooltip">Please select any site.</Tooltip>;
		const today = moment();
		const yesterday = moment().subtract(1, 'day');
		const last7Days = moment()
			.subtract(1, 'week')
			.subtract(1, 'day');
		const presets = [
			{
				text: 'Today',
				start: today,
				end: today
			},
			{
				text: 'Yesterday',
				start: yesterday,
				end: yesterday
			},
			{
				text: 'Last 7 Days',
				start: last7Days,
				end: yesterday
			},
			{
				text: 'Last 30 Days',
				start: moment().subtract(30, 'day'),
				end: yesterday
			},
			{
				text: 'This Month',
				start: moment().startOf('month'),
				end: today
			},
			{
				text: 'Last Month',
				start: moment()
					.subtract(1, 'months')
					.startOf('month'),
				end: moment()
					.subtract(1, 'months')
					.endOf('month')
			}
		];

		const { state } = this;
		return (
			<Fragment>
				<div className="aligner aligner--wrap aligner--hSpaceBetween u-margin-t4">
					<div className="aligner-item u-margin-r4">
						{/* eslint-disable */}
						<label className="u-text-normal">Report By</label>
						<Selectbox
							isClearable={false}
							isSearchable={false}
							selected={state.selectedDimension || ''}
							options={state.dimensionList}
							onSelect={selectedDimension => {
								this.setState({ selectedDimension });
							}}
						/>
						{/* eslint-enable */}
					</div>
					<div className="aligner-item u-margin-r4">
						{/* eslint-disable */}
						<label className="u-text-normal">Filter</label>
						<AsyncGroupSelect
							filterList={state.filterList}
							selectedFilters={state.selectedFilters}
							onFilterValueChange={this.onFilterValueChange}
							getSelectedFilter={this.getSelectedFilter}
						/>
						{/* eslint-enable */}
					</div>
					<div className="aligner-item ">
						{/* eslint-disable */}
						<label className="u-text-normal">Date Range</label>
						<PresetDateRangePicker
							presets={presets}
							startDate={state.startDate}
							endDate={state.endDate}
							autoFocus
						/>
						{/* eslint-enable */}
					</div>
				</div>
				<div className="aligner aligner--wrap aligner--hEnd u-margin-t4">
					<div className="u-margin-r4">
						<Button
							bsStyle="primary"
							onClick={this.generateButtonHandler}
							disabled={state.disableGenerateButton}
						>
							<Glyphicon glyph="cog u-margin-r2" />
							Generate Report
						</Button>
					</div>
					<div>
						<Button onClick={this.generateButtonHandler} disabled={state.disableGenerateButton}>
							<Glyphicon glyph="download-alt u-margin-r2" />
							Export Report
						</Button>
					</div>
				</div>
				<div className="aligner aligner--wrap aligner--hSpaceBetween metricsRow u-margin-t5">
					{state.metricsList.map(metric =>
						metric.isDisabled ? (
							<OverlayTrigger placement="top" overlay={tooltip}>
								{/* eslint-disable */}
								<div
									className="metrics disabledMetrics aligner-item aligner aligner--vCenter aligner--hCenter u-margin-r2"
									key={metric}
									onClick={() => {
										this.onMetricsChange(metric);
									}}
								>
									{metric.value}
								</div>
								{/* eslint-enable */}
							</OverlayTrigger>
						) : (
							/* eslint-disable */
							<div
								className={`${metric.isSelected ? 'selectedMetrics' : 'metrics'} 
											${
												metric.isDisabled ? 'disabledMetrics' : ''
											} aligner-item aligner aligner--vCenter aligner--hCenter u-margin-r2`}
								key={metric}
								onClick={() => {
									this.onMetricsChange(metric);
								}}
							>
								{metric.value}
							</div>
							/* eslint-enable */
						)
					)}
				</div>
			</Fragment>
		);
	}
}

export default Control;
