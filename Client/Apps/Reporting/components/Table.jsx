import React from 'react';
import CustomReactTable from '../../../Components/CustomReactTable/index';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import sum from 'lodash/sum';

import moment from 'moment';
import { numberWithCommas, computeCsvData } from '../helpers/utils';
import { reactTableSortMethod } from '../../../helpers/commonFunctions';
import { columnsBlacklistedForAddition } from '../configs/commonConsts';

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
		const csvData = computeCsvData(data);
		this.props.getCsvData(csvData);
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

		const { metrics, dimension, aggregatedData } = this.props;

		const { isDaily } = this.getDateIntervalValidators();
		const computedDate = {
			Header: 'Date',
			accessor: 'date',
			sortable: isDaily,
			Cell: props =>
				isDaily ? <span>{moment(props.value).format('ll')}</span> : <span>{props.value}</span>,
			Footer: 'Total'
		};

		tableColumns.push(computedDate);

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
						metrics[column].valueType === 'money' ? (
							<span>${numberWithCommas(props.value)}</span>
						) : metrics[column].valueType === 'percent' ? (
							<span>{numberWithCommas(props.value)}%</span>
						) : (
							<span>{numberWithCommas(props.value)}</span>
						),
					sortMethod: (a, b) => reactTableSortMethod(a, b),
					aggregate: (vals, rows) => {
						let grouped = [];
						for (const key in aggregatedData) {
							if (key === rows[0].date) {
								aggregatedData[key].map(row => {
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
										else if (prop === 'network_ad_ecpm' && prop === column)
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

				tableRow.siteName =
					site && site[siteid]
						? React.cloneElement(<a href={`/reports/${siteid}`}>{site[siteid].siteName}</a>)
						: 'Not Found';
				delete tableRow.siteid;
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

	render() {
		const { tableBody, tableColumns, tableData } = this.state;
		const { startDate, endDate } = this.props;
		const { result } = tableData;

		const nummberOfdays = moment(endDate).diff(moment(startDate), 'days');

		const showAggregation = result.length > nummberOfdays + 1;

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
						defaultPageSize={10}
						pageSizeOptions={[10, 20, 30, 40, 50]}
						minRows={0}
						showPaginationTop
						showPaginationBottom={false}
						// pivotBy={showAggregation ? ['date'] : []}
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
