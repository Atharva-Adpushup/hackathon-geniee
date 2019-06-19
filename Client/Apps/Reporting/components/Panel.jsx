import React, { Component, Fragment } from 'react';
import { Row, Col } from 'react-bootstrap';
import moment from 'moment';
import { Object } from 'es6-shim';
import ActionCard from '../../../Components/ActionCard/index';
import ControlContainer from '../containers/ControlContainer';
import TableContainer from '../containers/TableContainer';
import ChartContainer from '../containers/ChartContainer';
import reportService from '../../../services/reportService';
import { displayMetrics } from '../configs/commonConsts';
import Loader from '../../../Components/Loader';
import { computeCsvData, convertObjToArr } from '../helpers/utils';
import qs from 'querystringify';

class Panel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dimensionList: convertObjToArr(props.dimension),
			filterList: convertObjToArr(props.filter),
			intervalList: convertObjToArr(props.interval),
			metricsList: displayMetrics,
			selectedDimension: '',
			selectedFilters: {},
			selectedMetrics: [],
			selectedInterval: 'daily',
			startDate: moment()
				.startOf('day')
				.subtract(7, 'days')
				.format('YYYY-MM-DD'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day')
				.format('YYYY-MM-DD'),
			tableData: {},
			csvData: [],
			reportType: 'account',
			isLoading: true
		};
	}

	componentDidMount() {
		const {
			match: {
				params: { siteId }
			},
			location: { search: queryParams }
		} = this.props;
		const selectedControls = qs.parse(queryParams);

		let {
			startDate,
			endDate,
			metricsList,
			selectedInterval,
			selectedDimension,
			selectedFilters
		} = this.state;
		if (Object.keys(selectedControls).length > 0) {
			let { dimension, interval, fromDate, toDate } = selectedControls;
			selectedDimension = dimension;
			selectedInterval = interval || 'daily';
			startDate = fromDate;
			endDate = toDate;
			this.onDimensionChange(selectedDimension);
			this.setState({ selectedDimension, selectedInterval, startDate, endDate });
		}

		if (siteId) {
			selectedFilters = { siteid: { [siteId]: true } };
			this.setState({ reportType: 'site', selectedFilters });
		}
		this.generateButtonHandler({
			startDate,
			endDate,
			metricsList,
			selectedFilters,
			selectedInterval,
			selectedDimension
		});
	}

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

	formateReportParams = data => {
		const {
			startDate,
			endDate,
			selectedDimension,
			selectedFilters,
			selectedInterval,
			metricsList
		} = data;
		const { site } = this.props;
		let selectedMetrics;
		if (metricsList) {
			selectedMetrics = metricsList
				.filter(metric => !metric.isDisabled)
				.map(metric => metric.value);
		}
		const params = {
			fromDate: moment(startDate).format('YYYY-MM-DD'),
			toDate: moment(endDate).format('YYYY-MM-DD'),
			metrics: selectedMetrics ? selectedMetrics.toString() : null,
			interval: selectedInterval,
			dimension: selectedDimension || null
		};
		for (const filter in selectedFilters) {
			const filters = Object.keys(selectedFilters[filter]);
			params[filter] = filters.length > 0 ? filters.toString() : null;
		}
		if (!params['siteid']) {
			const siteIds = Object.keys(site);
			params['siteid'] = siteIds.toString();
		}
		return params;
	};

	generateButtonHandler = data => {
		this.setState({ isLoading: true });
		const params = this.formateReportParams(data);

		reportService.getCustomStats(params).then(response => {
			if (response.status == 200 && response.data) {
				this.setState({ tableData: response.data });
			}
			this.setState({ isLoading: false });
		});
	};

	getFinalTableData = tableData => {
		let csvData = computeCsvData(tableData);
		this.setState({ csvData });
	};

	renderContent = () => {
		const {
			startDate,
			endDate,
			selectedDimension,
			selectedFilters,
			selectedMetrics,
			selectedInterval,
			dimensionList,
			filterList,
			intervalList,
			metricsList,
			tableData,
			reportType,
			csvData
		} = this.state;
		return (
			<Row>
				<Col sm={12}>
					<ControlContainer
						startDate={startDate}
						endDate={endDate}
						generateButtonHandler={this.generateButtonHandler}
						dimensionList={dimensionList}
						filterList={filterList}
						intervalList={intervalList}
						metricsList={metricsList}
						selectedDimension={selectedDimension}
						selectedFilters={selectedFilters}
						selectedMetrics={selectedMetrics}
						selectedInterval={selectedInterval}
						reportType={reportType}
						csvData={csvData}
					/>
				</Col>
				<Col sm={12} className="u-margin-t5">
					<ChartContainer
						tableData={tableData}
						selectedDimension={selectedDimension}
						startDate={startDate}
						endDate={endDate}
						metricsList={metricsList}
						selectedInterval={selectedInterval}
					/>
				</Col>
				<Col sm={12} className="u-margin-t5">
					<TableContainer
						tableData={tableData}
						startDate={startDate}
						endDate={endDate}
						selectedInterval={selectedInterval}
						getTableData={this.getFinalTableData}
					/>
				</Col>
			</Row>
		);
	};

	render() {
		let { isLoading } = this.state;
		return isLoading ? (
			<Loader />
		) : (
			<ActionCard title="AdPushup Reports">{this.renderContent()}</ActionCard>
		);
	}
}

export default Panel;
