import React from 'react';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import sum from 'lodash/sum';
import countBy from 'lodash/countBy';
import map from 'lodash/map';

import moment from 'moment';
import { numberWithCommas, computeCsvData } from '../helpers/utils';
import { reactTableSortMethod } from '../../../helpers/commonFunctions';
import { columnsBlacklistedForAddition } from '../configs/commonConsts';
import CustomReactTable from '../../../Components/CustomReactTable/index';

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

		const { metrics, dimension, aggregatedData, isURLReport } = this.props;

		const { isDaily, isMonthly } = this.getDateIntervalValidators();
		const computedDate = {
			Header: 'Date',
			accessor: 'date',
			sortable: isDaily,
			Cell: props =>
				isDaily ? <span>{moment(props.value).format('ll')}</span> : <span>{props.value}</span>,
			Footer: 'Total',
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
					tableColumns.push({
						Header: dimension[column].display_name,
						accessor: column,
						sortable: true,
						Footer: ''
					});
				}
			}

			if (metrics[column]) {
				// eslint-disable-next-line camelcase
				const { display_name: Header, table_position } = metrics[column];
				let footerValue = total[`total_${column}`] || '';

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
						default: {
							footerValue = numberWithCommas(footerValue);
						}
					}
				}

				sortedMetrics.push({
					Header,
					accessor: column,
					sortable: true,
					table_position,
					Footer: footerValue,
					Cell: props =>
						// eslint-disable-next-line no-nested-ternary
						metrics[column].valueType === 'money' ? (
							<span>${numberWithCommas(props.value)}</span>
						) : metrics[column].valueType === 'percent' ? (
							<span>{numberWithCommas(props.value)}%</span>
						) : metrics[column].valueType === 'url' ? (
							<a rel="noopener noreferrer">{props.value}</a>
						) : (
							<span>{numberWithCommas(props.value)}</span>
						),
					sortMethod: (a, b) => reactTableSortMethod(a, b),
					aggregate: (vals, rows) => {
						let grouped = [];
						// eslint-disable-next-line no-restricted-syntax
						for (const key in aggregatedData) {
							if (key === rows[0].date) {
								// eslint-disable-next-line no-loop-func
								aggregatedData[key].map(row => {
									// eslint-disable-next-line no-restricted-syntax
									for (const prop in row) {
										if (!columnsBlacklistedForAddition.includes(prop) && prop === column)
											grouped = !Number.isInteger(sum(aggregatedData[key].map(val => val[prop])))
												? sum(aggregatedData[key].map(val => val[prop])).toFixed(2)
												: sum(aggregatedData[key].map(val => val[prop]));
										else if (prop === 'adpushup_ad_ecpm' && prop === column)
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
										else if (prop === 'adpushup_count_percent' && prop === column) grouped = 100;
									}
								});
								return grouped;
							}
						}
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

				if (site) {
					tableRow.siteName = React.cloneElement(
						<a href={`/reports/${siteid}`}>{tableRow.site}</a>
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
		const { isURLReport, onPageSizeChange, onPageChange } = this.props;

		// don't need aggregation for URL Report
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
