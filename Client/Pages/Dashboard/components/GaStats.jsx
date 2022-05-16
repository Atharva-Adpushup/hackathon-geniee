import React from 'react';
import moment from 'moment';
import countBy from 'lodash/countBy';
import map from 'lodash/map';
import omit from 'lodash/omit';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import sum from 'lodash/sum';
import mean from 'lodash/mean';
import mapValues from 'lodash/mapValues';
import CustomReactTable from '../../../Components/CustomReactTable/index';
import { getWidgetValidDationState, roundOffTwoDecimal } from '../helpers/utils';
import { reactTableSortMethod } from '../../../helpers/commonFunctions';

const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// eslint-disable-next-line react/sort-comp
function aggregateValues(result) {
	const modifiedResult = [];

	result.forEach(row => {
		const tableRow = { ...row };
		modifiedResult.push(tableRow);
	});

	const groupedData = mapValues(groupBy(modifiedResult, 'date'), reportData =>
		reportData.map(data => omit(data, 'date'))
	);

	return groupedData;
}

function sortHeadersByPosition(columns, metrics, dimension, aggregatedData, total) {
	let tableColumns = [];
	let sortedMetrics = [];

	const computedDate = {
		Header: 'Date',
		accessor: 'date',
		sortable: true,
		Cell: props => <span>{moment(props.value).format('ll')}</span>,
		Footer: 'Total',
		pivot: true
	};
	tableColumns.push(computedDate);

	columns.forEach(col => {
		if (dimension[col]) {
			if (col === 'siteid') {
				tableColumns.push({
					Header: 'Site Name',
					accessor: 'siteName',
					sortable: true,
					Footer: ''
				});
			} else {
				tableColumns.push({
					Header: dimension[col].display_name,
					accessor: col,
					sortable: true,
					Footer: ''
				});
			}
		}

		if (metrics[col]) {
			const { display_name: Header, table_position } = metrics[col];
			let footerValue = total[`total_${col}`] || 0;

			switch (metrics[col].valueType) {
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
				accessor: col,
				sortable: true,
				table_position,
				Footer: footerValue,
				Cell: props => {
					if (metrics[col].valueType === 'money')
						return <span>${numberWithCommas(props.value)}</span>;

					if (metrics[col].valueType === 'percent')
						return <span>{numberWithCommas(props.value)}%</span>;

					if (metrics[col].valueType === 'url')
						return <a rel="noopener noreferrer">{props.value}</a>;

					return <span>{numberWithCommas(props.value)}</span>;
				},
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
									if (prop === col) {
										if (isNaN(sum(aggregatedData[key].map(val => +val[prop])))) {
											// eslint-disable-next-line no-restricted-globals
											grouped = sum(aggregatedData[key].map(val => val[prop]));
										} else {
											grouped =
												col === 'ga_pv_per_session' || col === 'ga_session_rpm'
													? mean(aggregatedData[key].map(val => +val[prop])).toFixed(2)
													: sum(aggregatedData[key].map(val => +val[prop]));
										}
									}
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

	return sortBy(tableColumns, o => o.position);
}

function computeTableData(data, props) {
	let { result, total } = data;

	Object.keys(total).forEach(column => {
		total[column] = parseFloat(roundOffTwoDecimal(total[column]));
	});

	const { columns } = data;
	const aggregatedData = result ? aggregateValues(result) : {};
	const tableHeader = [];
	const { metrics, dimension } = props;

	if ((result, columns)) {
		const sortedHeaders = sortHeadersByPosition(columns, metrics, dimension, aggregatedData, total);
		sortedHeaders.forEach(
			({ Header, accessor, Cell, Footer, pivot, sortable, sortMethod, aggregate }) => {
				tableHeader.push({
					Header,
					accessor,
					Cell,
					Footer,
					pivot,
					sortable,
					aggregate,
					sortMethod: (a, b) => reactTableSortMethod(a, b)
				});
			}
		);

		result = result.map(row => {
			const { siteid, site } = row;
			const computedSiteName = site;
			row.siteName = computedSiteName
				? React.cloneElement(<a href={`/reports/${siteid}`}>{computedSiteName}</a>)
				: 'Not Found';
			row.url = React.cloneElement(
				<a
					target="_blank"
					rel="noopener noreferrer"
					href={`https://${site}`}
					style={{ textDecoration: 'underline', color: '#1E90FF' }}
				>
					{site}
				</a>
			);
			return row;
		});
		formatTableData(result, metrics);
	}

	result = sortBy(result, row => row.date);
	const computedState = { tableHeader, tableBody: result || [], aggregatedData };
	return computedState;
}

function formatTableData(tableBody, metrics) {
	// const { metrics } = props;

	tableBody.forEach(row => {
		// eslint-disable-next-line no-restricted-syntax
		for (const col in row) {
			if (metrics[col]) {
				const num = row[col];

				if (metrics[col].valueType === 'money') {
					row[col] = `${numberWithCommas(roundOffTwoDecimal(num))}`;
				} else if (col === 'ga_pv_per_session') {
					row[col] = numberWithCommas(roundOffTwoDecimal(num));
				} else {
					row[col] = numberWithCommas(num);
				}
			}
		}
	});
}

function checkForAggregation(tableBody) {
	const dateCount = countBy(map(tableBody, 'date'));
	for (const key in dateCount) {
		if (dateCount[key] > 1) {
			return true;
		}
		return false;
	}
}

const DEFAULT_STATE = {
	tableHeader: [],
	tableBody: [],
	aggregatedData: {}
};

class GaStats extends React.PureComponent {
	state = DEFAULT_STATE;

	static getDerivedStateFromProps(props) {
		const { displayData, dirty } = props;
		const { isValid, isValidAndEmpty } = getWidgetValidDationState(displayData);

		if (!isValid) {
			return null;
		}

		if (isValidAndEmpty) {
			return DEFAULT_STATE;
		}

		if (dirty) {
			return null;
		}

		const computedState = computeTableData(displayData, props);
		return { ...computedState };
	}

	renderTable() {
		const { tableBody, tableHeader } = this.state;
		const { selectedDimension } = this.props;
		const showAggregation = checkForAggregation(tableBody);

		return (
			<>
				{tableBody && tableBody.length > 0 ? (
					<CustomReactTable
						columns={tableHeader}
						data={tableBody}
						showPaginationTop
						showPaginationBottom={false}
						pageSizeOptions={[10, 20, 30, 40, 50]}
						defaultPageSize={10}
						minRows={0}
						pivotBy={selectedDimension && showAggregation ? ['date'] : []}
					/>
				) : (
					<div className="text-center">No Record Found.</div>
				)}
			</>
		);
	}

	render() {
		return this.renderTable();
	}
}

export default GaStats;
