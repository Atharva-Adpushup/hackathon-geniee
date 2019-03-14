import React, { Component, Fragment } from 'react';
import { Glyphicon, Row, Col, FormGroup, InputGroup, FormControl, Button } from 'react-bootstrap';
import AsyncGroupSelect from '../../../Components/AsyncGroupSelect/index';
import 'react-dates/initialize';
import PresetDateRangePicker from '../../../Components/PresetDateRangePicker/index';
import Selectbox from '../../../Components/Selectbox/index';
import moment from 'moment';
import 'react-dates/lib/css/_datepicker.css';
import _ from 'lodash';

class Control extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dimensionList: [],
			filterList: [],
			metricsList: [
				'Overview',
				'Layout Editor',
				'AP Tag',
				'Innovative Ads',
				'Mediation',
				'Header Bidding',
				'AMP',
				'AdRecover'
			],
			startDate: props.startDate,
			endDate: props.endDate,
			selectedDimensions: props.selectedDimensions,
			selectedMetrics: props.selectedMetrics,
			selectedFilters: props.selectedFilters,
			disableGenerateButton: false
		};
		this.formatOptionLabel = this.formatOptionLabel.bind(this);
		this.addNewDimension = this.addNewDimension.bind(this);
		this.removeDimension = this.removeDimension.bind(this);
		this.datesUpdated = this.datesUpdated.bind(this);
		this.focusUpdated = this.focusUpdated.bind(this);
		this.formatFilterAndDimensionList = this.formatFilterAndDimensionList.bind(this);
		this.onDimensionChange = this.onDimensionChange.bind(this);
		this.onMetricsChange = this.onMetricsChange.bind(this);
		this.onFilterValueChange = this.onFilterValueChange.bind(this);
		this.generateButtonHandler = this.generateButtonHandler.bind(this);
	}
	componentDidMount = () => {
		this.formatFilterAndDimensionList();
	};
	onDimensionChange(data, index) {
		let { selectedDimensions, dimensionList } = this.state;
		selectedDimensions[index] = { value: data.value, label: data.label };
		dimensionList.forEach(dimension => {
			let isDimensionSelected = selectedDimensions.find(selectedDimension => {
				return selectedDimension.value == dimension.value;
			});
			dimension.isDisabled = !!isDimensionSelected;
		});
		this.setState({ selectedDimensions, dimensionList });
	}
	formatFilterAndDimensionList() {
		let dimensions = Object.keys(this.props.dimensionList).map(dimension => {
				return {
					value: dimension,
					label: this.props.dimensionList[dimension].display_name,
					isDisabled: this.props.dimensionList[dimension].isDisabled,
					position: this.props.dimensionList[dimension].position
				};
			}),
			dimensionList = dimensions.sort(function(a, b) {
				return a.position - b.position;
			}),
			filters = Object.keys(this.props.filterList).map(filter => {
				return {
					value: filter,
					label: this.props.filterList[filter].display_name,
					path: this.props.filterList[filter].path,
					isDisabled: this.props.filterList[filter].isDisabled,
					position: this.props.filterList[filter].position
				};
			}),
			filterList = filters.sort(function(a, b) {
				return a.position - b.position;
			});
		this.setState({ dimensionList, filterList });
	}
	formatOptionLabel(data) {
		const groupStyles = {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between'
		};
		return (
			<div style={groupStyles}>
				<span>{data.label}</span>
				<Glyphicon glyph="menu-right" className="u-margin-r2" />
			</div>
		);
	}
	addNewDimension() {
		let { selectedDimensions } = this.state;
		selectedDimensions.push({});
		this.setState({
			selectedDimensions
		});
	}
	removeDimension(index) {
		let { selectedDimensions } = this.state;
		selectedDimensions.splice(index, 1);
		this.setState({
			selectedDimensions
		});
	}
	datesUpdated({ startDate, endDate }) {
		this.setState({ startDate, endDate });
	}
	focusUpdated(focusedInput) {
		this.setState({ focusedInput });
	}
	onMetricsChange(metric) {
		let { selectedMetrics } = this.state,
			metricsIndex = selectedMetrics.indexOf(metric);
		if (metricsIndex != -1) selectedMetrics.splice(metricsIndex, 1);
		else selectedMetrics.push(metric);
		this.setState({ selectedMetrics });
	}
	onFilterValueChange(selectedFilters) {
		this.setState({ selectedFilters });
	}
	generateButtonHandler() {
		let { startDate, endDate, selectedDimensions, selectedFilters, selectedMetrics } = this.state;
		this.props.generateButtonHandler({
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
			],
			{ state, props } = this;
		return (
			<Fragment>
				<div className="aligner aligner--wrap aligner--hSpaceBetween u-margin-t4">
					<div className="aligner-item u-margin-r4">
						<label className="u-text-normal">Report By</label>
						<Selectbox
							isClearable={false}
							isSearchable={false}
							value={_.isEmpty(state.selectedDimensions) ? '' : state.selectedDimensions}
							options={state.dimensionList}
							onChange={selectedDimension => {
								this.onDimensionChange(selectedDimension);
							}}
						/>
					</div>
					<div className="aligner-item u-margin-r4">
						<label className="u-text-normal">Filter</label>
						<AsyncGroupSelect
							filterList={state.filterList}
							selectedFilters={state.selectedFilters}
							onFilterValueChange={this.onFilterValueChange}
						/>
					</div>
					<div className="aligner-item ">
						<label className="u-text-normal">Date Range</label>
						<PresetDateRangePicker
							presets={presets}
							startDate={state.startDate}
							endDate={state.endDate}
							autoFocus
						/>
					</div>
				</div>
				<div className="aligner aligner--wrap aligner--hEnd u-margin-t4">
					<div className="u-margin-r4">
						<Button
							bsStyle="primary"
							onClick={this.generateButtonHandler}
							disabled={this.disableGenerateButton}
						>
							<Glyphicon glyph="cog u-margin-r2" />
							Generate Report
						</Button>
					</div>
					<div>
						<Button onClick={this.generateButtonHandler} disabled={this.disableGenerateButton}>
							<Glyphicon glyph="download-alt u-margin-r2" />
							Export Report
						</Button>
					</div>
				</div>

				<div className="aligner aligner--wrap aligner--hSpaceBetween metricsRow u-margin-t5">
					{state.metricsList.map(metric => {
						return (
							<div
								className={`${
									state.selectedMetrics.indexOf(metric) != -1 ? 'selectedMetrics' : 'metrics'
								} 
											${
												metric.isDisabled ? 'disabledMetrics' : ''
											} aligner-item aligner aligner--vCenter aligner--hCenter u-margin-r2`}
								key={metric}
								onClick={() => {
									this.onMetricsChange(metric);
								}}
							>
								{metric}
							</div>
						);
					})}
				</div>
			</Fragment>
		);
	}
}

export default Control;
