import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import moment from 'moment';
import { Object } from 'es6-shim';
import qs from 'querystringify';
import { isEmpty, union } from 'lodash';
import ActionCard from '../../../Components/ActionCard/index';
import ControlContainer from '../containers/ControlContainer';
import TableContainer from '../containers/TableContainer';
import ChartContainer from '../containers/ChartContainer';
import reportService from '../../../services/reportService';
import { displayMetrics } from '../configs/commonConsts';
import Loader from '../../../Components/Loader';
import { convertObjToArr } from '../helpers/utils';

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

		let {
			startDate,
			endDate,
			selectedInterval,
			selectedDimension,
			selectedFilters,
			reportType
		} = this.state;

		const selectedControls = qs.parse(queryParams);

		if (siteId) {
			selectedFilters = { siteid: { [siteId]: true } };
			reportType = 'site';
		}

		if (Object.keys(selectedControls).length > 0) {
			const { dimension, interval, fromDate, toDate } = selectedControls;
			selectedDimension = dimension;
			selectedInterval = interval || 'daily';
			startDate = fromDate;
			endDate = toDate;
		}

		const params = this.getControlChangedParams({
			startDate,
			endDate,
			selectedInterval,
			selectedDimension,
			selectedFilters,
			reportType
		});
		this.setState(
			{
				...params
			},
			this.generateButtonHandler
		);
	}

	disableControl = (disabledFilter, disabledDimension, disabledMetrics) => {
		const { dimensionList, filterList, metricsList } = this.state;

		filterList.map(filter => {
			const found = disabledFilter.find(fil => fil === filter.value);
			if (found) filter.isDisabled = true;
			else filter.isDisabled = false;
		});

		dimensionList.map(dimension => {
			const found = disabledDimension.find(dim => dim === dimension.value);
			if (found) dimension.isDisabled = true;
			else dimension.isDisabled = false;
		});

		metricsList.map(metrics => {
			const found = disabledMetrics.find(metric => metric === metrics.value);
			if (found) metrics.isDisabled = true;
			else metrics.isDisabled = false;
		});

		return {
			filterList,
			metricsList,
			dimensionList
		};
	};

	getReportType = selectedFilters => {
		let reportType = 'account';
		const selectedSiteFilters = selectedFilters.siteid;
		if (selectedSiteFilters && Object.keys(selectedSiteFilters).length === 1) {
			reportType = 'site';
		}
		return reportType;
	};

	onControlChange = data => {
		this.setState({
			...data
		});
	};

	getControlChangedParams = controlParams => {
		const {
			startDate,
			endDate,
			selectedInterval,
			selectedDimension,
			selectedFilters,
			reportType
		} = controlParams;
		//	const reportType = this.getReportType(selectedFilters);
		const { dimensionList, filterList } = this.state;
		let disabledFilter = [];
		let disabledDimension = [];
		let disabledMetrics = [];
		const dimensionObj = dimensionList.find(dimension => dimension.value === selectedDimension);
		if (dimensionObj) {
			disabledFilter = dimensionObj.disabled_filter || disabledFilter;
			disabledDimension = dimensionObj.disabled_dimension || disabledDimension;
			disabledMetrics = dimensionObj.disabled_metrics || disabledMetrics;
		}
		Object.keys(selectedFilters).forEach(selectedFilter => {
			const filterObj = filterList.find(filter => filter.value === selectedFilter);
			if (filterObj && !isEmpty(selectedFilters[selectedFilter])) {
				disabledFilter = union(filterObj.disabled_filter, disabledFilter);
				disabledDimension = union(filterObj.disabled_dimension, disabledDimension);
				disabledMetrics = union(filterObj.disabled_metrics, disabledMetrics);
			}
		});
		const updatedControlList = this.disableControl(
			disabledFilter,
			disabledDimension,
			disabledMetrics
		);

		return {
			startDate,
			endDate,
			selectedInterval,
			selectedDimension,
			selectedFilters,
			reportType,
			dimensionList: updatedControlList.dimensionList,
			filterList: updatedControlList.filterList,
			metricsList: updatedControlList.metricsList
		};
	};

	formateReportParams = () => {
		const {
			startDate,
			endDate,
			selectedDimension,
			selectedFilters,
			selectedInterval,
			metricsList
		} = this.state;
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
		Object.keys(selectedFilters).forEach(filter => {
			const filters = Object.keys(selectedFilters[filter]);
			params[filter] = filters.length > 0 ? filters.toString() : null;
		});
		if (!params.siteid) {
			const siteIds = Object.keys(site);
			params.siteid = siteIds.toString();
		}
		return params;
	};

	generateButtonHandler = () => {
		this.setState({ isLoading: true });
		const params = this.formateReportParams();

		reportService.getCustomStats(params).then(response => {
			if (response.status == 200 && response.data) {
				this.setState({ tableData: response.data });
			}
			this.setState({ isLoading: false });
		});
	};

	getCsvData = csvData => {
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
						onControlChange={this.onControlChange}
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
						getCsvData={this.getCsvData}
					/>
				</Col>
			</Row>
		);
	};

	render() {
		const { isLoading } = this.state;
		return isLoading ? (
			<Loader />
		) : (
			<ActionCard title="AdPushup Reports">{this.renderContent()}</ActionCard>
		);
	}
}

export default Panel;
