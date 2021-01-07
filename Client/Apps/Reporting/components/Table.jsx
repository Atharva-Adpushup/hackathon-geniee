/* eslint-disable no-nested-ternary */
import React from 'react';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import sum from 'lodash/sum';
import countBy from 'lodash/countBy';
import map from 'lodash/map';

import moment from 'moment';
import CustomReactTable from '../../../Components/CustomReactTable/index';
import { numberWithCommas, computeCsvData } from '../helpers/utils';
import { reactTableSortMethod } from '../../../helpers/commonFunctions';
import { columnsBlacklistedForAddition, extraMetricsListForHB } from '../configs/commonConsts';

class Table extends React.Component {
	constructor(props) {
		super(props);
		const { metrics, tableData } = props;
		const { tableColumns, tableBody } = this.updateTableData(tableData);
		this.state = {
			metrics,
			tableData,
			tableColumns,
			tableBody
		};
	}

	componentWillReceiveProps({ tableData: nextTableData }) {
		const { tableData: currTableData } = this.props;

		if (!isEqual(currTableData, nextTableData)) {
			const { tableColumns, tableBody } = this.updateTableData(nextTableData);
			this.setState({ tableData: nextTableData, tableColumns, tableBody });
		}
	}

	setCsvData = data => {
		const { getCsvData } = this.props;
		const csvData = computeCsvData(data);
		getCsvData(csvData);
	};

	getDateIntervalValidators = () => {
		const { selectedInterval } = this.props;
		const isDaily = !!(selectedInterval === 'daily');
		const isMonthly = !!(selectedInterval === 'monthly');
		const isCumulative = !!(selectedInterval === 'cumulative');
		const resultObject = { isDaily, isMonthly, isCumulative };

		return resultObject;
	};

	getTableColumns = (columns, total) => {
		let tableColumns = [];
		let sortedMetrics = [];

		const { metrics, dimension, aggregatedData, selectedDimension, isHB, isURLReport } = this.props;

		// metrics is being fetched fom global data from table container
		// actually this should be passed by parent component where we ca
		// control which metrics/dimension to pass when needed
		// added isHB flag and hardcoded metrics to display in table for HB only
		if (isHB) {
			extraMetricsListForHB.map(item => {
				metrics[item.value] = item;
				return item;
			});
		}

		const { isDaily, isMonthly } = this.getDateIntervalValidators();
		const computedDate = {
			Header: 'Date',
			accessor: 'date',
			sortable: isDaily,
			Cell: props =>
				isDaily ? <span>{moment(props.value).format('ll')}</span> : <span>{props.value}</span>,
			Footer: !isHB ? 'Total' : '',
			pivot: !isURLReport
		};

		// we don't need date col for URL Reporting
		// eslint-disable-next-line no-unused-expressions
		!isURLReport
			? tableColumns.push(computedDate)
			: isURLReport && (isDaily || isMonthly) && tableColumns.push(computedDate);

		columns.forEach(column => {
			if (dimension[column]) {
				if (column === 'siteid') {
					tableColumns.push({
						Header: 'Site Name',
						accessor: 'siteName',
						sortable: true,
						Footer: ''
					});
				} else {
					// was getting some error - objects are not valid react child
					// added this condition to fix that
					// eslint-disable-next-line no-lonely-if
					if (!columnsBlacklistedForAddition.includes(column)) {
						tableColumns.push({
							Header: dimension[column].display_name,
							accessor: column,
							sortable: true,
							Footer: ''
						});
					}
				}
			}

			if (metrics[column]) {
				// eslint-disable-next-line camelcase
				let { display_name: Header, table_position } = metrics[column];
				let width = 100;
				let footerValue = total[`total_${column}`] || 0;
				if (footerValue) {
					switch (metrics[column].valueType) {
						case 'money': {
							footerValue = `$${numberWithCommas(footerValue.toFixed(2))}`;
							break;
						}
						case 'percent': {
							footerValue = `${numberWithCommas(footerValue.toFixed(2))}%`;
							break;
						}
						case 'milliseconds': {
							footerValue = `${numberWithCommas(footerValue.toFixed(2))} ms`;
							break;
						}

						default: {
							footerValue = numberWithCommas(footerValue);
						}
					}
					// we need of footer for blacklisted cols
					if (columnsBlacklistedForAddition.includes(column)) {
						footerValue = '';
					}
				}

				if (column === 'selectedDimensionColumn' && metrics[selectedDimension]) {
					const mapping = {
						country: 'Country',
						device_type: 'Device Type'
					};
					Header = mapping[selectedDimension];
					// eslint-disable-next-line camelcase
					table_position = 1;
				}
				if (column === 'country' || column === 'device_type') {
					width = 180;
				}

				sortedMetrics.push({
					Header,
					accessor: column,
					sortable: true,
					table_position,
					width,
					Footer: !isHB ? footerValue : '',
					Cell: props => {
						return metrics[column].valueType === 'money' ? (
							<span>${numberWithCommas(props.value)}</span>
						) : metrics[column].valueType === 'percent' ? (
							<span>{props.value}%</span>
						) : metrics[column].valueType === 'url' ? (
							<a rel="noopener noreferrer">{props.value}</a>
						) : metrics[column].valueType === 'milliseconds' ? (
							!props.aggregated ? (
								<span>{numberWithCommas(props.value)} ms</span>
							) : (
								<span>{props.value} ms</span>
							)
						) : column === 'average_response_time' ? (
							// hack: don't know but it was not working for this col so as to repeat it
							!props.aggregated ? (
								<span>{numberWithCommas(props.value)} ms</span>
							) : (
								<span>{props.value} ms</span>
							)
						) : (column === 'country' || column === 'device_type') &&
						  props.value &&
						  props.value instanceof Array ? (
							props.value &&
							props.value.map((val, index) => (
								// eslint-disable-next-line react/no-array-index-key
								<div key={index}>
									<span>
										{val[column]} {val.overall_net_revenue_percent.toFixed(2).replace(/\.00$/, '')}%
									</span>
								</div>
							))
						) : column === 'selectedDimensionColumn' && props.value && props.value ? (
							// eslint-disable-next-line react/no-array-index-key
							<div>
								<span>{props.value}</span>
							</div>
						) : column === 'prebid_win_percent' && props.value && props.value instanceof Array ? (
							props.value &&
							props.value.map((val, index) => (
								// eslint-disable-next-line react/no-array-index-key
								<div key={index}>
									<span>
										{val.name} {val.percentage}%
									</span>
								</div>
							))
						) : (
							<span>{numberWithCommas(props.value || 0)}</span>
						);
					},
					sortMethod: (a, b) => reactTableSortMethod(a, b),
					// eslint-disable-next-line consistent-return
					aggregate: (vals, rows) => {
						let grouped = [];
						/* eslint-disable */
						for (const key in aggregatedData) {
							if (key === rows[0].date) {
								aggregatedData[key].map(row => {
									for (const prop in row) {
										if (!columnsBlacklistedForAddition.includes(prop) && prop === column) {
												return grouped = !Number.isInteger(sum(aggregatedData[key].map(val => val[prop])))
													? sum(aggregatedData[key].map(val => val[prop])).toFixed(2)
													: sum(aggregatedData[key].map(val => val[prop]));
										}
										if (prop === 'adpushup_ad_ecpm' && prop === column)
											grouped = (
												(sum(aggregatedData[key].map(val => val.network_net_revenue)) /
													sum(aggregatedData[key].map(val => val.adpushup_impressions))) *
												1000
											).toFixed(2);
										else if (
											(prop === 'network_ad_ecpm' || prop === 'unique_ad_ecpm') &&
											prop === column
										)
											grouped = (
												(sum(aggregatedData[key].map(val => val.network_net_revenue)) /
													sum(aggregatedData[key].map(val => val.network_impressions))) *
												1000
											).toFixed(2);
										else if (prop === 'adpushup_page_cpm' && prop === column)
											grouped = (
												(sum(aggregatedData[key].map(val => val.network_net_revenue)) /
													sum(aggregatedData[key].map(val => val.adpushup_page_views))) *
												1000
											).toFixed(2);
										else if (prop === 'adpushup_xpath_miss_percent' && prop === column)
											grouped = (
												(sum(aggregatedData[key].map(val => val.adpushup_xpath_miss)) /
													(sum(aggregatedData[key].map(val => val.adpushup_xpath_miss)) +
														sum(aggregatedData[key].map(val => val.adpushup_impressions)))) *
												100
											).toFixed(2);
										else if (prop === 'prebid_win_percent' && prop === column)
											grouped = (
												(sum(aggregatedData[key].map(val => val.prebid_bid_win)) /
													(sum(aggregatedData[key].map(val => val.prebid_bid_win)) +
														sum(aggregatedData[key].map(val => val.prebid_bid_requests)))) *
												100
											).toFixed(2);
										else if (prop === 'prebid_bid_ecpm' && prop === column)
											grouped = (
												(sum(aggregatedData[key].map(val => val.prebid_bid_revenue)) /
													sum(aggregatedData[key].map(val => val.prebid_bid_received))) *
												1000
											).toFixed(2);
										else if (prop === 'prebid_win_ecpm' && prop === column)
											grouped = (
												(sum(aggregatedData[key].map(val => val.prebid_win_revenue)) /
													sum(aggregatedData[key].map(val => val.prebid_bid_win))) *
												1000
											).toFixed(2);
										else if (prop === 'overall_win_ecpm' && prop === column)
											grouped = (
												(sum(aggregatedData[key].map(val => val.overall_net_revenue)) /
													sum(aggregatedData[key].map(val => val.overall_bid_win))) *
												1000
											).toFixed(2);
										else if (prop === 'overall_win_percent' && prop === column)
											grouped = (
												(sum(aggregatedData[key].map(val => val.overall_bid_win)) /
													(sum(aggregatedData[key].map(val => val.overall_bid_win)) +
														sum(aggregatedData[key].map(val => val.prebid_bid_requests)))) *
												100
											).toFixed(2);
										else if (prop === 'prebid_timeouts_percentage' && prop === column)
											grouped = (
												(sum(aggregatedData[key].map(val => val.prebid_bid_timeouts)) /
													(sum(aggregatedData[key].map(val => val.prebid_bid_timeouts)) +
														sum(aggregatedData[key].map(val => val.prebid_bid_requests)))) *
												100
											).toFixed(2);
										else if (prop === 'bid_rate' && prop === column) {
											grouped = (
												(sum(aggregatedData[key].map(val => val.prebid_bid_received)) /
													(sum(aggregatedData[key].map(val => val.prebid_bid_received)) +
														sum(aggregatedData[key].map(val => val.prebid_bid_requests)))) *
												100
											).toFixed(2);
										}
										else if (prop === 'country' && prop === column) {
											grouped = this.processAndreduceEntityWiseData(aggregatedData[key], 'country')
										} else if (prop === 'device_type' && prop === column) {
											grouped = this.processAndreduceEntityWiseData(aggregatedData[key], 'device_type')
										} else if (prop === 'selectedDimensionColumn' && prop === column) {
											grouped = aggregatedData[key].map(val => val.selectedDimensionColumn).join(',')
										} else if (prop === 'average_response_time' && prop === column) {
											grouped = (
												sum(aggregatedData[key].map(val => val.average_response_time)) / aggregatedData[key].length
											).toFixed(2)
										}
										else if (prop === 'adpushup_count_percent' && prop === column) grouped = 100;
									}
								});
								return grouped;
							}
						}
						/* eslint-enable */
					}
				});
			}
		});

		sortedMetrics = sortBy(sortedMetrics, column => column.table_position).map(column => {
			const headerCopy = { ...column };
			delete headerCopy.table_position;

			return headerCopy;
		});

		tableColumns = [...tableColumns, ...sortedMetrics];

		return tableColumns;
	};

	processAndreduceEntityWiseData = (aggregatedData, entity) => {
		const entityObj = {};
		// get sum of overall net revenue for each entity and for each date
		// eslint-disable-next-line array-callback-return
		let totalRevenue = 0;
		const entityBasedRevenue = {};
		aggregatedData.map(row => {
			row[entity].map(item => {
				if (!entityObj[item[entity]]) {
					entityObj[item[entity]] = [];
					entityBasedRevenue[item[entity]] = 0;
				}
				entityObj[item[entity]].push(item);
			});

			Object.keys(entityObj).map(entityItem => {
				const totalEntityWiseRevenue = entityObj[entityItem].reduce((acc, item) => {
					// eslint-disable-next-line no-param-reassign
					acc += item.overall_net_revenue;
					return acc;
				}, 0);
				// entityObj[country] = totalEntityWiseRevenue;
				if (!entityBasedRevenue[entityItem]) {
					entityBasedRevenue[entityItem] = {
						[entity]: entityItem,
						totalEntityWiseRevenue: 0
					};
				}
				entityBasedRevenue[entityItem].totalEntityWiseRevenue += totalEntityWiseRevenue;
				totalRevenue += totalEntityWiseRevenue;
			});
		});

		return (
			Object.keys(entityBasedRevenue)
				.map(entityItem => {
					entityBasedRevenue[entityItem].totalEntityWiseRevenuePerc =
						(entityBasedRevenue[entityItem].totalEntityWiseRevenue / totalRevenue) * 100;
					return entityBasedRevenue[entityItem];
				})
				.map(item => ({
					[entity]: item[entity],
					overall_net_revenue_percent: item.totalEntityWiseRevenuePerc
				}))
				// sort with percentage
				.sort(
					(a, b) => Number(b.overall_net_revenue_percent) - Number(a.overall_net_revenue_percent)
				)
				.splice(0, 5)
		); // get top 5 results
	};

	getTableBody = tableBody => {
		let tableData = [...tableBody];
		const displayTableData = [];
		const { startDate, endDate, site } = this.props;
		const { isDaily, isMonthly, isCumulative } = this.getDateIntervalValidators();

		if (isDaily) tableData = sortBy(tableData, row => row.date);

		if (isMonthly) tableData = sortBy(sortBy(tableData, row => row.month), row => row.year);

		tableData.forEach(row => {
			const tableRow = { ...row };

			if (isDaily) tableRow.date = tableRow.date;

			if (isMonthly) {
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

			if (isCumulative)
				tableRow.date = `${moment(startDate).format('ll')} to ${moment(endDate).format('ll')}`;

			if (tableRow.siteid) {
				const { siteid } = tableRow;

				if (site && site[siteid]) {
					tableRow.siteName = React.cloneElement(
						<a href={`/reports/${siteid}`}>{site[siteid].siteName}</a>
					);
				} else return;

				delete tableRow.siteid;
			}

			if (tableRow.url) {
				const { url } = tableRow;
				// adjust url acc to width - add break points for every '-'
				const splitURL = url.split('-');
				tableRow.url = React.cloneElement(
					<a target="_blank" rel="noopener noreferrer" href={`https://${url}`}>
						{splitURL.map((item, index) => (
							// eslint-disable-next-line react/no-array-index-key
							<span key={index}>
								{`${index !== 0 ? '-' : ''}${item}`}
								<wbr />
							</span>
						))}
					</a>
				);
			}
			if (tableRow.utm_key) {
				tableRow.utm_key = tableRow.display_name;
			}

			displayTableData.push(tableRow);
		});

		return displayTableData;
	};

	updateTableData = tableData => {
		let tableColumns = [];
		let tableBody = [];
		if (tableData.columns && tableData.result.length > 0) {
			const { columns, result, total } = tableData;
			tableColumns = this.getTableColumns(columns, total);
			tableBody = this.getTableBody(result);
			this.setCsvData({ tableBody, tableColumns });
		}
		return { tableBody, tableColumns };
	};

	checkForAggregation(tableBody) {
		const dateCount = countBy(map(tableBody, 'date'));
		for (const key in dateCount) {
			if (dateCount[key] > 1) {
				return true;
			}
			return false;
		}
	}

	render() {
		const { tableBody, tableColumns, tableData } = this.state;
		const { isURLReport, onPageSizeChange, onPageChange, isHB } = this.props;

		// don't need aggregation for HB and URL Report
		const showAggregation = !isURLReport ? this.checkForAggregation(tableBody) : false;

		const onSortFunction = {
			network_net_revenue(columnValue) {
				if (typeof columnValue === 'string') return parseFloat(columnValue.replace(/[,$]/g, ''));
				return columnValue;
			},
			adpushup_page_views(columnValue) {
				if (typeof columnValue === 'string') return parseFloat(columnValue.replace(/,/g, ''));
				return columnValue;
			},
			network_impressions(columnValue) {
				if (typeof columnValue === 'string') return parseFloat(columnValue.replace(/,/g, ''));
				return columnValue;
			},
			network_ad_ecpm(columnValue) {
				if (typeof columnValue === 'string') return parseFloat(columnValue.replace(/[,$]/g, ''));
				return columnValue;
			},
			adpushup_page_cpm(columnValue) {
				if (typeof columnValue === 'string') return parseFloat(columnValue.replace(/[,$]/g, ''));
				return columnValue;
			},
			date(columnValue) {
				return moment(columnValue, 'll').valueOf();
			}
		};
		if (tableData && tableData.result && tableData.result.length > 0)
			return (
				<React.Fragment>
					<CustomReactTable
						columns={tableColumns}
						data={tableBody}
						defaultPageSize={isURLReport ? 150 : 10}
						pageSizeOptions={isURLReport ? [150] : [10, 20, 30, 40, 50]}
						minRows={0}
						showPaginationTop
						showPaginationBottom={false}
						onPageSizeChange={onPageSizeChange}
						onPageChange={onPageChange}
						pivotBy={showAggregation ? ['date'] : []}
					/>
					<div className="u-margin-t3">
						<b>*Note:</b> Net Revenue is estimated earnings, finalized earnings may vary depending
						on deductions from the demand partners.
					</div>
				</React.Fragment>
			);
		return '';
	}
}
export default Table;
