/* eslint-disable no-prototype-builtins */
import React, { Component } from 'react';
import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';
import groupBy from 'lodash/groupBy';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import moment from 'moment';
import sortBy from 'lodash/sortBy';
import Empty from '../../../../Components/Empty/index';

import TableContainer from '../../containers/TableContainer';
import reportService from '../../../../services/reportService';
import Loader from '../../../../Components/Loader';
import { roundOffTwoDecimal } from '../../helpers/utils';
import {
	displayUniqueImpressionMetrics,
	displayOpsMetricsForXPath,
	REPORT_INTERVAL_TABLE_KEYS,
	columnsBlacklistedForAddition,
	DEFAULT_ERROR_MESSAGE
} from '../../configs/commonConsts';
import MixpanelHelper from '../../../../helpers/mixpanel';

class XPathAndAPImpressions extends Component {
	constructor(props) {
		super(props);
		const {
			selectedDimension,
			selectedFilters,
			selectedInterval,
			startDate,
			endDate,
			dimensionList
		} = props;
		this.state = {
			dimensionList,
			metricsList: displayOpsMetricsForXPath,
			selectedDimension,
			selectedFilters,
			selectedFilterValues: {},
			selectedInterval,
			startDate,
			endDate,
			reportType: props.reportType || 'account',
			isLoading: true,
			isError: false,
			errorMessage: '',
			isValidSite: true,
			isReportingSite: true
		};
	}

	componentDidMount() {
		return this.generateButtonHandler();
	}

	handleError = err => {
		const {
			user: { data: user }
		} = this.props;
		console.log(err);
		const isAdmin = !!user.isSuperUser;
		const errorMessage =
			err && err.response && err.response.data && err.response.data.data && isAdmin
				? err.response.data.data.data || err.response.data.data.message || DEFAULT_ERROR_MESSAGE
				: DEFAULT_ERROR_MESSAGE;
		this.setState({ isLoading: false, isError: true, errorMessage });
	};

	generateButtonHandler = (inputState = {}) => {
		if (Object.keys(inputState).length) {
			const {
				reportType,
				selectedInterval,
				selectedDimension,
				selectedFilters,
				startDate,
				endDate
			} = inputState;
			const reportDateDifference = moment(endDate).diff(moment(startDate), 'days') + 1;
			const properties = {
				reportType,
				reportDateDifference,
				interval: selectedInterval,
				dimension: selectedDimension,
				filters: Object.keys(selectedFilters),
				toDate: endDate,
				fromDate: startDate
			};
			MixpanelHelper.trackEvent('Reports', properties);
		}

		let { tableData = { result: [], columns: [] }, metricsList, selectedFilterValues } = this.state;
		const { selectedDimension, selectedFilters, dimensionList } = this.state;
		const { reportType, XPATHParams, isForOps } = this.props;
		const computedState = Object.assign({ isLoading: true }, inputState);
		const prevMetricsList = metricsList;

		this.setState(computedState, () => {
			let newState = {};

			reportService
				.getAPStatsByCustom(XPATHParams)
				.then(response => {
					if (
						response &&
						Number(response.status) === 200 &&
						response.data &&
						!response.data.error
					) {
						tableData = response.data.data;

						const shouldAddAdpushupCountPercentColumn =
							(selectedDimension === 'mode' ||
								selectedDimension === 'error_code' ||
								selectedFilters.mode ||
								selectedFilters.error_code) &&
							tableData.columns.indexOf('adpushup_count') !== -1;

						// Add columns
						if (isForOps && shouldAddAdpushupCountPercentColumn) {
							tableData.columns.push('adpushup_count_percent');

							// eslint-disable-next-line no-inner-declarations
							function getComputedIntervalKey(row) {
								const { date, month, year } = row;

								if (date) return date;
								if (month && year) return `${month}-${year}`;
								return 'cumulative';
							}

							const adpushupCountTotalObj = tableData.result.reduce((totalObj, row) => {
								const { adpushup_count: adpushupCount } = row;
								const key = getComputedIntervalKey(row);

								if (Number.isInteger(totalObj[key])) {
									// eslint-disable-next-line no-param-reassign
									totalObj[key] += adpushupCount;
								} else {
									// eslint-disable-next-line no-param-reassign
									totalObj[key] = adpushupCount;
								}

								return totalObj;
							}, {});

							tableData.result.forEach(row => {
								const key = getComputedIntervalKey(row);

								const perc = (row.adpushup_count / adpushupCountTotalObj[key]) * 100;
								// eslint-disable-next-line no-param-reassign
								row.adpushup_count_percent = perc;
							});
						}

						// Compute data table total
						if (
							reportType === 'global' &&
							!tableData.total &&
							tableData.columns &&
							tableData.columns.length
						) {
							tableData.total = this.computeTotal(tableData.result);
						}

						// Hack by Harpreet
						// not working for global reports when site filter is selected
						// repeating above code
						if (
							reportType === 'site' &&
							!tableData.total &&
							tableData.columns &&
							tableData.columns.length
						) {
							tableData.total = this.computeTotal(tableData.result);
						}

						tableData.result.forEach(row => {
							Object.keys(row).forEach(column => {
								if (
									REPORT_INTERVAL_TABLE_KEYS.indexOf(column) === -1 &&
									!Number.isNaN(row[column]) &&
									!dimensionList.find(dimension => dimension.value === column) &&
									column !== 'site'
								) {
									// eslint-disable-next-line no-param-reassign
									row[column] = parseFloat(roundOffTwoDecimal(row[column]));
								}
							});
						});

						Object.keys(tableData.total).forEach(column => {
							tableData.total[column] = parseFloat(roundOffTwoDecimal(tableData.total[column]));
						});

						if (tableData.columns && tableData.columns.length) {
							metricsList = this.getMetricsList(tableData);
							// we need to persist user column selection when user
							// generates report multiple times.
							// for that we will check users previous selection, if it
							// is different from default list override default wit
							// previous values
							if (isForOps && prevMetricsList.length !== metricsList.length) {
								metricsList = [...prevMetricsList];
							} else if (isForOps) {
								// for same length we need to check for individual value
								const listPrevColList = prevMetricsList
									.map(item => item.value)
									.sort()
									.join();
								const defaultPrevColList = metricsList
									.map(item => item.value)
									.sort()
									.join();
								if (listPrevColList !== defaultPrevColList) {
									metricsList = [...prevMetricsList];
								}
							}
							newState = { ...newState, metricsList };
						}
					}

					newState = {
						...newState,
						isLoading: false,
						isError: false,
						tableData,
						selectedFilterValues
					};
					this.setState(newState);
				})
				.catch(this.handleError);
		});
	};

	getSortedMetaMetrics = metaMetrics => {
		const metaMetricsArray = Object.keys(metaMetrics).map(value => {
			// eslint-disable-next-line camelcase
			const { display_name: name, chart_position, valueType } = metaMetrics[value];

			return {
				name,
				value,
				valueType,
				chart_position
			};
		});
		return sortBy(metaMetricsArray, ['chart_position']);
	};

	/**
	 * Get first 5 metrics from report data
	 * - remove dimensions and intervals from report columns
	 * - remove unselectable items (given in meta)
	 * - sort by chart position (given in meta)
	 * - pick first 5
	 * @memberof Panel
	 */
	getMetricsList = tableData => {
		const {
			reportsMeta,
			isForOps,
			user: {
				data: { isUniqueImpEnabled = false }
			}
		} = this.props;
		const filteredMetrics = tableData.columns.filter(metric => {
			const isDimension = !!reportsMeta.data.dimension[metric];
			const isBlacklistedMetric = REPORT_INTERVAL_TABLE_KEYS.indexOf(metric) !== -1;
			const isSelectableMetric =
				reportsMeta.data.metrics[metric] && reportsMeta.data.metrics[metric].selectable;

			return !isDimension && !isBlacklistedMetric && isSelectableMetric;
		});

		const sortedMetaMetrics = this.getSortedMetaMetrics(reportsMeta.data.metrics);

		let computedMetrics = [];

		sortedMetaMetrics.forEach(metaMetric => {
			const { name, value, valueType } = metaMetric;
			if (filteredMetrics.indexOf(value) !== -1) computedMetrics.push({ name, value, valueType });
		});

		let match = displayOpsMetricsForXPath.map(item => item.value);
		if (isForOps) {
			match = displayOpsMetricsForXPath.map(item => item.value);
			computedMetrics = computedMetrics.filter(item => match.indexOf(item.value) !== -1);
		} else {
			// check if unique imp is checked
			if (isUniqueImpEnabled) {
				match = displayUniqueImpressionMetrics.map(item => item.value);
			}
			computedMetrics = computedMetrics.filter(item => match.indexOf(item.value) !== -1);
		}
		return computedMetrics;
	};

	computeTotal = tableRows => {
		const { dimensionList } = this.state;
		const total = tableRows.reduce((totalAccumulator, tableRow) => {
			const totalCopy = { ...totalAccumulator };

			if (tableRow && typeof tableRow === 'object' && Object.keys(tableRow).length) {
				// eslint-disable-next-line no-restricted-syntax
				for (const column in tableRow) {
					if (
						REPORT_INTERVAL_TABLE_KEYS.indexOf(column) === -1 &&
						!Number.isNaN(tableRow[column]) &&
						!dimensionList.find(dimension => dimension.value === column)
					) {
						if (columnsBlacklistedForAddition.indexOf(column) !== -1) {
							totalCopy[`total_${column}`] = 0;
						} else {
							totalCopy[`total_${column}`] = totalCopy[`total_${column}`]
								? totalCopy[`total_${column}`] + tableRow[column]
								: tableRow[column];
						}
					}
				}
			}

			return totalCopy;
		}, {});

		if (
			total.hasOwnProperty('total_network_net_revenue') &&
			total.hasOwnProperty('total_adpushup_impressions')
		) {
			if (total.hasOwnProperty('total_adpushup_ad_ecpm')) {
				total.total_adpushup_ad_ecpm =
					(total.total_network_net_revenue / total.total_adpushup_impressions) * 1000;
			}

			if (total.hasOwnProperty('total_network_ad_ecpm')) {
				total.total_network_ad_ecpm =
					(total.total_network_net_revenue / total.total_network_impressions) * 1000;
			}
		}

		if (
			total.hasOwnProperty('total_adpushup_page_cpm') &&
			total.hasOwnProperty('total_network_net_revenue') &&
			total.hasOwnProperty('total_adpushup_page_views')
		) {
			total.total_adpushup_page_cpm =
				(total.total_network_net_revenue / total.total_adpushup_page_views) * 1000;
		}

		if (
			total.hasOwnProperty('total_adpushup_xpath_miss_percent') &&
			total.hasOwnProperty('total_adpushup_xpath_miss') &&
			total.hasOwnProperty('total_adpushup_impressions')
		) {
			total.total_adpushup_xpath_miss_percent = (
				(total.total_adpushup_xpath_miss /
					(total.total_adpushup_xpath_miss + total.total_adpushup_impressions)) *
				100
			).toFixed(2);
		}

		if (total.hasOwnProperty('total_session_rpm')) {
			total.total_session_rpm /= tableRows.length;
		}

		if (total.hasOwnProperty('total_adpushup_count_percent')) {
			delete total.total_adpushup_count_percent;
		}

		return total;
	};

	getCsvData = csvData => {
		const { getXPathCSVCsvData } = this.props;
		// pass data to parent component
		getXPathCSVCsvData(csvData);
	};

	renderEmptyMessage = msg => <Empty message={msg} />;

	filterTableDataBySelectedMetrics = (tableData, metricsList, dimensionList) => {
		const selectedMetricsTableData = tableData;
		selectedMetricsTableData.columns = selectedMetricsTableData.columns.filter(
			column =>
				!!metricsList.find(metric => metric.value === column) ||
				REPORT_INTERVAL_TABLE_KEYS.indexOf(column) !== -1 ||
				!!dimensionList.find(dimension => dimension.value === column)
		);

		selectedMetricsTableData.result = selectedMetricsTableData.result.map(row => {
			const computedRow = { ...row };

			// eslint-disable-next-line no-restricted-syntax
			for (const key in computedRow) {
				if (
					!metricsList.find(metric => metric.value === key) &&
					REPORT_INTERVAL_TABLE_KEYS.indexOf(key) === -1 &&
					!dimensionList.find(dimension => dimension.value === key) &&
					!computedRow.site
				) {
					delete computedRow[key];
				}
			}

			return computedRow;
		});

		const computedTotal = { ...selectedMetricsTableData.total };

		// eslint-disable-next-line no-restricted-syntax
		for (const key in computedTotal) {
			if (!metricsList.find(metric => `total_${metric.value}` === key)) {
				delete computedTotal[key];
			}
		}

		selectedMetricsTableData.total = computedTotal;

		return selectedMetricsTableData;
	};

	// eslint-disable-next-line react/sort-comp
	aggregateValues(result) {
		const modifiedResult = [];
		const { selectedInterval, startDate, endDate } = this.state;

		result.forEach(row => {
			const tableRow = { ...row };

			if (selectedInterval === 'daily') tableRow.date = tableRow.date;

			if (selectedInterval === 'monthly' && tableRow.month) {
				let monthlyDateRangeStart;
				let monthlyDateRangeEnd;

				// Compute monthlyDateRangeStart
				if (`${tableRow.year}-${tableRow.month}` === moment(startDate).format('Y-M')) {
					monthlyDateRangeStart = moment(startDate).format('ll');
				} else {
					monthlyDateRangeStart = moment()
						.month(tableRow.month - 1) // moment accepts 0-11 months
						.year(tableRow.year)
						.startOf('month')
						.format('ll');
				}

				// Compute monthlyDateRangeEnd
				if (`${tableRow.year}-${tableRow.month}` === moment(endDate).format('Y-M')) {
					monthlyDateRangeEnd = moment(endDate).format('ll');
				} else {
					monthlyDateRangeEnd = moment()
						.month(tableRow.month - 1) // moment accepts 0-11 months
						.year(tableRow.year)
						.endOf('month')
						.format('ll');
				}

				tableRow.date = `${monthlyDateRangeStart} to ${monthlyDateRangeEnd}`;
			}

			if (selectedInterval === 'cumulative')
				tableRow.date = `${moment(startDate).format('ll')} to ${moment(endDate).format('ll')}`;

			modifiedResult.push(tableRow);
		});
		const groupedData = mapValues(groupBy(modifiedResult, 'date'), reportData =>
			reportData.map(data => omit(data, 'date'))
		);

		return groupedData;
	}

	renderContent = () => {
		const {
			selectedDimension,
			selectedInterval,
			reportType,
			startDate,
			endDate,
			isValidSite,
			isReportingSite,
			dimensionList,
			metricsList,
			tableData
		} = this.state;
		const { reportType: defaultReportType, isForOps } = this.props;

		const aggregatedData = this.aggregateValues(tableData.result);

		if (reportType === 'site') {
			if (!isValidSite)
				return this.renderEmptyMessage(
					'Seems like you have entered an invalid siteid in url. Please check.'
				);
			if (!isReportingSite) return this.renderEmptyMessage('No Data Available');
		}

		let selectedMetricsTableData = JSON.parse(JSON.stringify(tableData));

		if (tableData.result && tableData.result.length) {
			selectedMetricsTableData = this.filterTableDataBySelectedMetrics(
				selectedMetricsTableData,
				metricsList,
				dimensionList
			);
		}

		return (
			<Row>
				<Col className="u-margin-b4">
					<TableContainer
						tableData={selectedMetricsTableData}
						aggregatedData={aggregatedData}
						startDate={startDate}
						endDate={endDate}
						selectedInterval={selectedInterval}
						selectedDimension={selectedDimension}
						getCsvData={this.getCsvData}
						reportType={reportType}
						defaultReportType={defaultReportType}
						isForOps={isForOps}
						forceHideCaption
					/>
				</Col>
			</Row>
		);
	};

	render() {
		const { isLoading, isError, errorMessage } = this.state;
		const { reportsMeta } = this.props;

		if ((!reportsMeta.fetched && !isError) || isLoading) {
			return <Loader />;
		}

		if (!isLoading && isError) {
			return <Empty message={errorMessage} />;
		}

		return <React.Fragment>{this.renderContent()}</React.Fragment>;
	}
}

export default XPathAndAPImpressions;
