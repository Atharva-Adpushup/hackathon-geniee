import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import moment from 'moment';
import { Object } from 'es6-shim';
import qs from 'querystringify';
import isEmpty from 'lodash/isEmpty';
import union from 'lodash/union';
import ActionCard from '../../../Components/ActionCard/index';
import Empty from '../../../Components/Empty/index';
import ControlContainer from '../containers/ControlContainer';
import TableContainer from '../containers/TableContainer';
import ChartContainer from '../containers/ChartContainer';
import reportService from '../../../services/reportService';
import {
	displayMetrics,
	accountDisableFilter,
	accountDisableDimension,
	opsDimension,
	opsFilter
} from '../configs/commonConsts';
import Loader from '../../../Components/Loader';
import { convertObjToArr } from '../helpers/utils';

class Panel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dimensionList: [],
			filterList: [],
			intervalList: [],
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
			isLoading: true,
			isValidSite: true,
			isReportingSite: true
		};
	}

	componentDidMount() {
		const { reportsMeta, userSites, fetchReportingMeta } = this.props;
		const userSitesStr = Object.keys(userSites).toString();

		if (!reportsMeta.fetched) {
			return reportService.getMetaData({ sites: userSitesStr }).then(response => {
				const { data } = response;
				fetchReportingMeta(data);
				return this.getContentInfo(data);
			});
		}

		return this.getContentInfo(reportsMeta.data);
	}

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

	disableControl = (disabledFilter, disabledDimension, disabledMetrics) => {
		const { metricsList } = this.state;
		const { reportsMeta } = this.props;
		const { dimension: dimensionListObj, filter: filterListObj } = reportsMeta.data;
		const dimensionList = convertObjToArr(dimensionListObj);
		const filterList = convertObjToArr(filterListObj);
		const { updatedDimensionList, updatedFilterList } = this.removeOpsFilterDimension(
			filterList,
			dimensionList
		);

		updatedFilterList.map(filter => {
			const found = disabledFilter.find(fil => fil === filter.value);
			if (found) filter.isDisabled = true;
			else filter.isDisabled = false;
		});

		updatedDimensionList.map(dimension => {
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
			updatedFilterList,
			metricsList,
			updatedDimensionList
		};
	};

	onControlChange = data => {
		const params = this.getControlChangedParams(data);
		this.setState({
			...params,
			...data
		});
	};

	getControlChangedParams = controlParams => {
		const { selectedDimension, selectedFilters, reportType } = controlParams;
		const { reportsMeta } = this.props;
		const { dimension: dimensionList, filter: filterList } = reportsMeta.data;
		let disabledFilter = [];
		let disabledDimension = [];
		let disabledMetrics = [];
		const dimensionObj = dimensionList[selectedDimension];
		if (dimensionObj) {
			disabledFilter = dimensionObj.disabled_filter || disabledFilter;
			disabledDimension = dimensionObj.disabled_dimension || disabledDimension;
			disabledMetrics = dimensionObj.disabled_metrics || disabledMetrics;
		}
		Object.keys(selectedFilters).forEach(selectedFilter => {
			const filterObj = filterList[selectedFilter];
			if (filterObj && !isEmpty(selectedFilters[selectedFilter])) {
				disabledFilter = union(filterObj.disabled_filter, disabledFilter);
				disabledDimension = union(filterObj.disabled_dimension, disabledDimension);
				disabledMetrics = union(filterObj.disabled_metrics, disabledMetrics);
			}
		});
		if (reportType == 'account') {
			disabledFilter = union(accountDisableFilter, disabledFilter);
			disabledDimension = union(accountDisableDimension, disabledDimension);
		}
		const updatedControlList = this.disableControl(
			disabledFilter,
			disabledDimension,
			disabledMetrics
		);

		return {
			dimensionList: updatedControlList.updatedDimensionList,
			filterList: updatedControlList.updatedFilterList,
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
		const { userSites } = this.props;
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
			const siteIds = Object.keys(userSites);
			params.siteid = siteIds.toString();
		}
		return params;
	};

	generateButtonHandler = () => {
		let { tableData } = this.state;
		const params = this.formateReportParams();

		this.setState({ isLoading: true }, () => {
			reportService.getCustomStats(params).then(response => {
				if (Number(response.status) === 200 && response.data) {
					tableData = response.data;
				}
				this.setState({ isLoading: false, tableData });
			});
		});
	};

	getCsvData = csvData => {
		this.setState({ csvData });
	};

	renderEmptyMessage = msg => <Empty message={msg} />;

	getContentInfo = reportsMetaData => {
		let {
			selectedDimension,
			selectedFilters,
			selectedInterval,
			reportType,
			startDate,
			endDate
		} = this.state;
		const {
			match: {
				params: { siteId }
			},
			location: { search: queryParams },
			userSites
		} = this.props;
		const { site: reportingSites, interval: intervalsObj } = reportsMetaData;
		const selectedControls = qs.parse(queryParams);
		const isValidSite = !!(userSites && userSites[siteId] && userSites[siteId].siteDomain);
		const isReportingSite = !!(reportingSites && reportingSites[siteId]);
		if (siteId) {
			reportType = 'site';
			if (isValidSite && isReportingSite) {
				selectedFilters = { siteid: { [siteId]: true } };
			}
		}
		if (Object.keys(selectedControls).length > 0) {
			const { dimension, interval, fromDate, toDate } = selectedControls;
			selectedDimension = dimension;
			selectedInterval = interval || 'daily';
			startDate = fromDate;
			endDate = toDate;
		}
		const { dimensionList, filterList, metricsList } = this.getControlChangedParams({
			startDate,
			endDate,
			selectedInterval,
			selectedDimension,
			selectedFilters,
			reportType
		});
		const intervalList = convertObjToArr(intervalsObj);
		this.setState(
			{
				startDate,
				endDate,
				selectedInterval,
				selectedDimension,
				selectedFilters,
				reportType,
				dimensionList,
				filterList,
				metricsList,
				intervalList
			},
			this.generateButtonHandler
		);
	};

	renderContent = () => {
		const {
			selectedDimension,
			selectedFilters,
			selectedInterval,
			selectedMetrics,
			reportType,
			startDate,
			endDate,
			csvData,
			isValidSite,
			isReportingSite,
			dimensionList,
			intervalList,
			metricsList,
			filterList,
			tableData
		} = this.state;
		if (reportType == 'site') {
			if (!isValidSite)
				return this.renderEmptyMessage(
					'Seems like you have entered an invalid siteid in url. Please check.'
				);
			if (!isReportingSite) return this.renderEmptyMessage('No Data Available');
		}
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
						selectedDimension={selectedDimension}
						getCsvData={this.getCsvData}
					/>
				</Col>
			</Row>
		);
	};

	render() {
		const { isLoading } = this.state;
		const { reportsMeta } = this.props;
		if (!reportsMeta.fetched || isLoading) {
			return <Loader />;
		}
		return <ActionCard title="AdPushup Reports">{this.renderContent()}</ActionCard>;
	}
}

export default Panel;
