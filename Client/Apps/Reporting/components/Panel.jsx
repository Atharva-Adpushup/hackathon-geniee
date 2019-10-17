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
import { DEMO_ACCOUNT_DATA } from '../../../constants/others';
import Loader from '../../../Components/Loader';
import { convertObjToArr } from '../helpers/utils';
import {
	getReportingDemoUserValidation,
	getReportingDemoUserSiteIds,
	getDemoUserSites
} from '../../../helpers/commonFunctions';

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
			selectedChartLegendMetric: '',
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
			reportType: props.reportType || 'account',
			isLoading: true,
			isValidSite: true,
			isReportingSite: true
		};
	}

	componentDidMount() {
		const { userSites, updateReportMetaData, reportsMeta } = this.props;
		const { email, reportType } = this.getDemoUserParams();

		let userSitesStr = '';
		let isSuperUser = false;

		if (reportType === 'account') {
			userSitesStr = Object.keys(userSites).toString();

			userSitesStr = getReportingDemoUserSiteIds(userSitesStr, email, reportType);
		}

		if (reportType === 'global') {
			isSuperUser = true;
		}

		if (!reportsMeta.fetched) {
			return reportService.getMetaData({ sites: userSitesStr, isSuperUser }).then(response => {
				let { data: computedData } = response;

				computedData = getDemoUserSites(computedData, email);
				updateReportMetaData(computedData);
				return this.getContentInfo(computedData);
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

	disableControl = (disabledFilter, disabledDimension, disabledMetrics, metricsList) => {
		const { metricsList: metricsListFromState } = this.state;
		const computedMetricsList = metricsList || metricsListFromState;

		const {
			reportsMeta,
			user: {
				data: { isSuperUser }
			}
		} = this.props;

		const { dimension: dimensionListObj, filter: filterListObj } = reportsMeta.data;
		const dimensionList = convertObjToArr(dimensionListObj);
		const filterList = convertObjToArr(filterListObj);
		const { updatedDimensionList, updatedFilterList } = isSuperUser
			? { updatedDimensionList: dimensionList, updatedFilterList: filterList }
			: this.removeOpsFilterDimension(filterList, dimensionList);

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

		computedMetricsList.map(metrics => {
			const found = disabledMetrics.find(metric => metric === metrics.value);
			if (found) metrics.isDisabled = true;
			else metrics.isDisabled = false;
		});

		return {
			updatedFilterList,
			metricsList: computedMetricsList,
			updatedDimensionList
		};
	};

	onControlChange = data => {
		const params = this.getControlChangedParams(data);

		this.setState({
			...params
		});
	};

	getDemoUserParams = () => {
		const {
			user: {
				data: { email }
			}
		} = this.props;
		const { reportType } = this.state;
		const computedObject = { email, reportType };

		return computedObject;
	};

	getControlChangedParams = (controlParams, metricsList) => {
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

		if (reportType === 'account' || reportType === 'global') {
			disabledFilter = union(accountDisableFilter, disabledFilter);
			disabledDimension = union(accountDisableDimension, disabledDimension);
		}

		const updatedControlList = this.disableControl(
			disabledFilter,
			disabledDimension,
			disabledMetrics,
			metricsList
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
		const { email, reportType } = this.getDemoUserParams();
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

		if (reportType === 'global') {
			params.siteid = '';
			params.isSuperUser = true;
		}

		if (reportType === 'account') {
			params.siteid = getReportingDemoUserSiteIds(params.siteid, email, reportType);
		}

		return params;
	};

	generateButtonHandler = (inputState = {}) => {
		let { tableData } = this.state;
		const { reportType } = this.props;
		const computedState = Object.assign({ isLoading: true }, inputState);

		this.setState(computedState, () => {
			const params = this.formateReportParams();

			reportService.getCustomStats(params).then(response => {
				if (Number(response.status) === 200 && response.data) {
					tableData = response.data;
					if (
						reportType === 'global' &&
						!tableData.total &&
						tableData.columns &&
						tableData.columns.length
					) {
						tableData.total = tableData.result.reduce((total, tableRow) => {
							const computedTotal = total || {};

							if (tableRow && typeof tableRow === 'object' && Object.keys(tableRow).length) {
								// eslint-disable-next-line no-restricted-syntax
								for (const column in tableRow) {
									if (column !== 'date' && !Number.isNaN(tableRow[column])) {
										computedTotal[`total_${column}`] = computedTotal[`total_${column}`]
											? computedTotal[`total_${column}`] + tableRow[column]
											: tableRow[column];
									}
								}
							}

							return computedTotal;
						});
					}
				}
				this.setState({ isLoading: false, tableData });
			});
		});
	};

	updateMetrics = (newMetrics = []) => {
		this.setState({ metricsList: newMetrics });
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
			selectedChartLegendMetric,
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
		const { email } = this.getDemoUserParams();
		const { site: reportingSites, interval: intervalsObj } = reportsMetaData;
		const selectedControls = qs.parse(queryParams);
		const isValidSite = !!(userSites && userSites[siteId] && userSites[siteId].siteDomain);
		const isReportingData = !!reportingSites;
		const { isValid } = getReportingDemoUserValidation(email, reportType);
		const {
			DEFAULT_SITE: { SITE_ID }
		} = DEMO_ACCOUNT_DATA;
		const isDemoUserReportingSite = !!(isValid && isReportingData && reportingSites[SITE_ID]);
		const isReportingSite = !!(
			isReportingData &&
			(reportingSites[siteId] || isDemoUserReportingSite)
		);
		const computedSiteId = isDemoUserReportingSite ? SITE_ID : siteId;

		if (siteId) {
			reportType = 'site';
			if (isValidSite && isReportingSite) {
				selectedFilters = { siteid: { [computedSiteId]: true } };
			}
		}

		if (Object.keys(selectedControls).length > 0) {
			const { dimension, interval, fromDate, toDate, chartLegendMetric } = selectedControls;
			selectedDimension = dimension;
			selectedInterval = interval || 'daily';
			selectedChartLegendMetric = chartLegendMetric;
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
				selectedChartLegendMetric,
				reportType,
				dimensionList,
				filterList,
				metricsList,
				intervalList
			},
			this.generateButtonHandler
		);
	};

	getAllAvailableMetrics = (
		isCustomizeChartLegend,
		reportsMeta,
		selectedDimension,
		selectedFilters,
		reportType
	) => {
		let allAvailableMetrics = [];
		if (
			isCustomizeChartLegend &&
			reportsMeta &&
			reportsMeta.data &&
			reportsMeta.data.metrics &&
			typeof reportsMeta.data.metrics === 'object' &&
			Object.keys(reportsMeta.data.metrics).length
		) {
			const allAvailableMetricsArr = Object.keys(reportsMeta.data.metrics).map(key => ({
				name: reportsMeta.data.metrics[key].display_name,
				value: key,
				valueType: reportsMeta.data.metrics[key].valueType
			}));

			allAvailableMetrics = this.getControlChangedParams(
				{ selectedDimension, selectedFilters, reportType },
				allAvailableMetricsArr
			).metricsList;
		}

		return allAvailableMetrics;
	};

	renderContent = () => {
		const {
			selectedDimension,
			selectedFilters,
			selectedInterval,
			selectedMetrics,
			selectedChartLegendMetric,
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
		const { reportsMeta, reportType: defaultReportType, isCustomizeChartLegend } = this.props;

		const allAvailableMetrics = this.getAllAvailableMetrics(
			isCustomizeChartLegend,
			reportsMeta,
			selectedDimension,
			selectedFilters,
			reportType
		);

		const { email } = this.getDemoUserParams();
		const { isValid } = getReportingDemoUserValidation(email, reportType);

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
						defaultReportType={defaultReportType}
						csvData={csvData}
						isDemoUser={isValid}
					/>
				</Col>
				<Col sm={12} className="u-margin-t5">
					<ChartContainer
						tableData={tableData}
						selectedDimension={selectedDimension}
						startDate={startDate}
						endDate={endDate}
						metricsList={metricsList}
						allAvailableMetrics={allAvailableMetrics}
						reportType={reportType}
						isCustomizeChartLegend={isCustomizeChartLegend}
						updateMetrics={this.updateMetrics}
						selectedInterval={selectedInterval}
						selectedChartLegendMetric={selectedChartLegendMetric}
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
						reportType={reportType}
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
