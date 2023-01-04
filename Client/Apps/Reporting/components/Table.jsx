import React from 'react';
import sortBy from 'lodash/sortBy';
import sum from 'lodash/sum';
import countBy from 'lodash/countBy';
import map from 'lodash/map';
import isEqual from 'lodash/isEqual';

import moment from 'moment';
import { numberWithCommas, computeCsvData } from '../helpers/utils';
import { reactTableSortMethod } from '../../../helpers/commonFunctions';
import { columnsBlacklistedForAddition } from '../configs/commonConsts';
import CustomReactTable from '../../../Components/CustomReactTable/index';
import CustomToggle from '../../../Components/CustomToggle';
import CustomError from '../../../helpers/CustomError';

let expandedRows = {};
const formatCellValue = (value, valueType, percValue) => {
	switch (valueType) {
		case 'money':
			return (
				<span>
					${numberWithCommas(value)} ({percValue} %)
				</span>
			);
		case 'percent':
			return <span>{numberWithCommas(value)}%</span>;
		case 'url':
			return (
				<span>
					<a rel="noopener noreferrer">{value}</a>
				</span>
			);
		default:
			return (
				<span>
					{numberWithCommas(value)} ({percValue} %)
				</span>
			);
	}
};

const getDateIntervalValidators = props => {
	const { selectedInterval } = props;
	const isDaily = !!(selectedInterval === 'daily');
	const isMonthly = !!(selectedInterval === 'monthly');
	const isCumulative = !!(selectedInterval === 'cumulative');
	const resultObject = { isDaily, isMonthly, isCumulative };

	return resultObject;
};

const getTableBody = (tableBody, props) => {
	let tableData = [...tableBody];
	const displayTableData = [];
	const { startDate, endDate, site } = props;
	const { isDaily, isMonthly, isCumulative } = getDateIntervalValidators(props);

	if (isDaily) tableData = sortBy(tableData, row => row.date);

	if (isMonthly)
		tableData = sortBy(
			sortBy(tableData, row => row.month),
			row => row.year
		);

	tableData.forEach(row => {
		const tableRow = { ...row, day: '' };
		try {
			tableRow.day = `${moment(tableRow.date).format('dddd')}`;

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
			if (tableRow.utm_key) {
				tableRow.utm_key = tableRow.display_name;
			}

			displayTableData.push(tableRow);
		} catch (err) {
			throw new CustomError(err, {
				tableRow,
				startDate,
				endDate,
				site,
				isDaily,
				isMonthly,
				isCumulative
			});
		}
	});

	return displayTableData;
};

const getTableColumns = (columns, total, props, state) => {
	let tableColumns = [];
	let sortedMetrics = [];

	const {
		metrics,
		dimension,
		aggregatedData,
		isURLReport,
		memoizedAggregation,
		selectedDimension
	} = props;
	const { showPercentInReport } = state;

	const { isDaily, isMonthly } = getDateIntervalValidators(props);
	const computedDate = {
		Header: 'Date',
		accessor: 'date',
		sortable: isDaily,
		Cell: props =>
			isDaily ? (
				// Show Day of the week with date
				<span>{moment(props.value).format('ll')}</span>
			) : (
				<span>{props.value}</span>
			),
		Footer: 'Total',
		pivot: !isURLReport
	};

	// we don't need date col for URL Reporting
	// eslint-disable-next-line no-unused-expressions
	!isURLReport
		? tableColumns.push(computedDate)
		: isURLReport && (isDaily || isMonthly) && tableColumns.push(computedDate);

	const computedDay = {
		Header: 'Day',
		accessor: 'day',
		Cell: props => {
			if (isDaily && selectedDimension.length === 0) {
				// Show Day of the week with date
				return <span>{props.value}</span>;
			}
			return '';
		},
		sortable: isDaily,
		Footer: ''
	};

	if (isDaily && selectedDimension.length === 0) {
		tableColumns.push(computedDay);
	}

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
			let footerValue = total[`total_${column}`] || 0;

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

			sortedMetrics.push({
				Header,
				accessor: column,
				sortable: true,
				table_position,
				Footer: footerValue,
				Cell: props => {
					const { aggregated, row, value } = props;
					// for showing percentage along with child rows
					if (!aggregated && showPercentInReport) {
						const {
							column: { id },
							original: { date }
						} = props;
						if (row && row.date) {
							if (!columnsBlacklistedForAddition.includes(id)) {
								if (memoizedAggregation[date] && memoizedAggregation[date][id]) {
									return formatCellValue(
										value,
										metrics[column].valueType,
										((+value * 100) / +memoizedAggregation[date][id]).toFixed(2)
									);
								}
							}
						}
					}
					// eslint-disable-next-line no-nested-ternary
					return metrics[column].valueType === 'money' ? (
						<span>${numberWithCommas(value)}</span>
					) : metrics[column].valueType === 'percent' ? (
						<span>{numberWithCommas(value)}%</span>
					) : metrics[column].valueType === 'url' ? (
						<a rel="noopener noreferrer">{value}</a>
					) : (
						<span>{numberWithCommas(value)}</span>
					);
				},
				sortMethod: (a, b) => reactTableSortMethod(a, b),
				aggregate: (vals, rows) => {
					let grouped = [];
					// eslint-disable-next-line no-restricted-syntax
					Object.keys(aggregatedData).map(key => {
						if (memoizedAggregation && !memoizedAggregation[key]) {
							memoizedAggregation[key] = {};
						}
						if (key === rows[0].date) {
							// eslint-disable-next-line no-loop-func
							aggregatedData[key].map(row => {
								// eslint-disable-next-line no-restricted-syntax
								for (const prop in row) {
									if (prop === column) {
										if (!columnsBlacklistedForAddition.includes(prop) && prop === column) {
											grouped = !Number.isInteger(sum(aggregatedData[key].map(val => val[prop])))
												? sum(aggregatedData[key].map(val => val[prop])).toFixed(2)
												: sum(aggregatedData[key].map(val => val[prop]));
										} else {
											switch (prop) {
												case 'adpushup_ad_ecpm':
													grouped = (
														(sum(aggregatedData[key].map(val => val.network_net_revenue)) /
															sum(aggregatedData[key].map(val => val.adpushup_impressions))) *
														1000
													).toFixed(2);
													break;
												case 'network_ad_ecpm':
													grouped = (
														(sum(aggregatedData[key].map(val => val.network_net_revenue)) /
															sum(aggregatedData[key].map(val => val.network_impressions))) *
														1000
													).toFixed(2);
													break;
												case 'unique_ad_ecpm':
													grouped = (
														(sum(aggregatedData[key].map(val => val.network_net_revenue)) /
															sum(aggregatedData[key].map(val => val.unique_impressions))) *
														1000
													).toFixed(2);
													break;
												case 'adpushup_page_cpm':
													grouped = (
														(sum(aggregatedData[key].map(val => val.network_net_revenue)) /
															sum(aggregatedData[key].map(val => val.adpushup_page_views))) *
														1000
													).toFixed(2);
													break;
												case 'adpushup_xpath_miss_percent':
													grouped = (
														(sum(aggregatedData[key].map(val => val.adpushup_xpath_miss)) /
															(sum(aggregatedData[key].map(val => val.adpushup_xpath_miss)) +
																sum(aggregatedData[key].map(val => val.adpushup_impressions)))) *
														100
													).toFixed(2);
													break;
												case 'adpushup_count_percent':
													grouped = 100;
													break;
												case 'network_ad_ctr':
													grouped = (
														(sum(aggregatedData[key].map(val => val.network_ad_clicks)) /
															sum(aggregatedData[key].map(val => val.network_impressions))) *
														100
													).toFixed(2);
													break;
												case 'unique_ad_ctr':
													grouped = (
														(sum(aggregatedData[key].map(val => val.unique_ad_clicks)) /
															sum(aggregatedData[key].map(val => val.unique_impressions))) *
														100
													).toFixed(2);
													break;
												default:
													// eslint-disable-next-line no-loop-func
													aggregatedData[key] = aggregatedData[key].map(item => {
														// eslint-disable-next-line no-param-reassign
														item[`new-${column}`] = `${item[column]} (${(item[column] / grouped) *
															100})`;
														return item;
													});
													break;
											}
										}
									}
								}
								return row;
							});
							// add percentage to individual row
							// eslint-disable-next-line no-loop-func
							memoizedAggregation[key][column] = grouped;
							memoizedAggregation[key].subRows = aggregatedData[key];
						}
						return key;
					});
					return grouped;
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

// For normal report view - Day of the day is being appended now
// in CSV adding a new column (Day) in that case
const appendDayToDateCSV = csvData => {
	const [cols] = csvData;
	if (cols.indexOf('Day') !== -1) {
		return csvData;
	}
	const dateIndex = cols.indexOf('Date');
	cols.splice(dateIndex + 1, 0, 'Day');
	return csvData.map((row, index) => {
		if (index !== 0) {
			// eslint-disable-next-line no-param-reassign
			row.splice(
				dateIndex + 1,
				0,
				row[dateIndex] !== 'Total' ? moment(row[dateIndex]).format('dddd') : ''
			);
		}
		return row;
	});
};

const setCsvData = (data, props) => {
	const { getCsvData, selectedInterval, selectedDimension } = props;
	const csvData = computeCsvData(data);

	// for interval daily and single dimens
	if (
		selectedInterval === 'daily' &&
		(!selectedDimension.length ||
			(selectedDimension.length === 1 && selectedDimension.includes('siteid')))
	) {
		getCsvData(appendDayToDateCSV(csvData));
	} else {
		getCsvData(csvData);
	}
};

const updateTableData = (tableData, props, state) => {
	let tableColumns = [];
	let tableBody = [];
	if (tableData.columns && tableData.result.length > 0) {
		const { columns, result, total } = tableData;
		tableColumns = getTableColumns(columns, total, props, state);
		tableBody = getTableBody(result, props, state);
		setCsvData({ tableBody, tableColumns }, props);
	}
	return { tableBody, tableColumns };
};

class Table extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tableData: null,
			tableColumns: null,
			tableBody: null,
			showPercentInReport: false
		};
		expandedRows = {};
	}

	static getDerivedStateFromProps(props, state) {
		if (
			(!state.tableData && !state.tableColumns) ||
			(state.tableData &&
				state.tableColumns &&
				!isEqual(props.tableData.columns, state.tableData.columns))
		) {
			const { tableData, subTable, aggregatedData } = props;
			// eslint-disable-next-line prefer-const
			let { tableColumns, tableBody } = updateTableData(tableData, props, state);
			if (subTable) {
				tableBody = Object.keys(aggregatedData).map(date => {
					const data = aggregatedData[date][0];
					data.date = date;
					return data;
				});
			}

			// Change in props
			return {
				tableData,
				tableColumns,
				tableBody
			};
		}

		return null; // No change to state
	}

	componentDidMount() {
		Array.from(document.getElementsByClassName('rt-pivot')).map(item => {
			item.addEventListener('click', () => {
				const parent = item.closest('.rt-tr-group');
				const index = Array.from(parent.parentElement.children).indexOf(parent);
				const isExpanded = parent.querySelector('.rt-expander').classList.toString();
				if (parent) {
					expandedRows[index] = !(isExpanded === 'rt-expander -open');
				}
			});
			return item;
		});
	}

	checkForAggregation(tableBody) {
		const dateCount = countBy(map(tableBody, 'date'));
		for (const key in dateCount) {
			if (dateCount[key] > 1) {
				return true;
			}
		}
		// fixed the bug of checking only first date count value for aggregation
		return false;
	}

	handleShowPercentageToggle = () => {
		const { tableData, showPercentInReport } = this.state;
		this.setState(
			{
				tableData: { ...tableData },
				showPercentInReport: !showPercentInReport
			},
			() => {
				const { tableColumns, tableBody } = updateTableData(tableData, this.props, this.state);
				this.setState(
					{
						tableData,
						tableColumns,
						tableBody
					},
					() => {
						const allParentRows = Array.from(document.getElementsByClassName('rt-pivot'));
						Object.keys(expandedRows).map(rowIndex => {
							if (expandedRows[rowIndex]) {
								setTimeout(() => {
									allParentRows[rowIndex].click();
								}, 10);
							}
						});
					}
				);
			}
		);
	};

	appendShowPercWidgetToTable = showPercentInReport => {
		const { selectedDimension } = this.props;
		return (
			(selectedDimension.length === 1 && (
				<CustomToggle
					css="toggleWrapper"
					label="Show percentage in Report"
					selectedItem={showPercentInReport}
					handleToggle={this.handleShowPercentageToggle}
					options={['Yes', 'No']}
				/>
			)) ||
			''
		);
	};

	render() {
		const { tableBody, tableColumns, tableData, showPercentInReport } = this.state;
		const {
			isURLReport,
			onPageSizeChange,
			onPageChange,
			aggregatedData,
			subTable,
			isSubTable,
			selectedDimension
		} = this.props;

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
						defaultPageSize={isURLReport ? 150 : 50}
						pageSizeOptions={isURLReport ? [150] : [50, 100, 200, 300, 400]}
						minRows={0}
						showPaginationTop
						showPaginationBottom={false}
						onPageSizeChange={onPageSizeChange}
						onPageChange={onPageChange}
						pivotBy={selectedDimension.length === 1 && showAggregation ? ['date'] : []}
						// subTable={subTable}
						customTableControlsParentClass=""
						customTableControls={[this.appendShowPercWidgetToTable(showPercentInReport)]}
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
