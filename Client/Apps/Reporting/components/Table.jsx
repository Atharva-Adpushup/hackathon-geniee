import React from 'react';
import ReactTable from 'react-table';
import { Col } from 'react-bootstrap';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import moment from 'moment';
import { numberWithCommas, computeCsvData, roundOffTwoDecimal } from '../helpers/utils';
import { reactTableSortMethod } from '../../../helpers/commonFunctions';

class Table extends React.Component {
	constructor(props) {
		super(props);
		const { metrics, tableData } = props;
		const { tableHeader, tableBody, grandTotal } = this.updateTableData(tableData);
		this.state = {
			metrics,
			tableData,
			tableHeader,
			tableBody,
			grandTotal
		};
	}

	componentWillReceiveProps({ tableData: nextTableData }) {
		const { tableData: currTableData } = this.props;

		if (!isEqual(currTableData, nextTableData)) {
			const { tableHeader, tableBody, grandTotal } = this.updateTableData(nextTableData);
			this.setState({ tableData: nextTableData, tableHeader, tableBody, grandTotal });
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

	getTableHeaders = headers => {
		let tableHeader = [];
		let sortedMetrics = [];
		const { metrics, dimension } = this.props;
		const { isDaily } = this.getDateIntervalValidators();

		const computedDate = {
			Header: 'Date',
			accessor: 'date',
			sortable: isDaily,
			sortMethod: (a, b) => reactTableSortMethod(a, b)
		};

		tableHeader.push(computedDate);

		headers.forEach(header => {
			if (dimension[header]) {
				if (header === 'siteid') {
					tableHeader.push({
						Header: 'Site Name',
						accessor: 'siteName',
						sortable: true
					});
				} else {
					tableHeader.push({
						Header: dimension[header].display_name,
						accessor: header,
						sortable: true
					});
				}
			}

			if (metrics[header]) {
				// eslint-disable-next-line camelcase
				const { display_name: Header, table_position } = metrics[header];

				sortedMetrics.push({
					Header,
					accessor: header,
					sortable: true,
					table_position,
					sortMethod: (a, b) => reactTableSortMethod(a, b)
				});
			}
		});

		sortedMetrics = sortBy(sortedMetrics, header => header.table_position).map(header => {
			const headerCopy = { ...header };
			delete headerCopy.table_position;

			return headerCopy;
		});

		tableHeader = [...tableHeader, ...sortedMetrics];

		return tableHeader;
	};

	getTableBody = tableBody => {
		let tableData = [...tableBody];
		let displayTableData = [];
		const { startDate, endDate, site } = this.props;
		const { isDaily, isMonthly, isCumulative } = this.getDateIntervalValidators();

		if (isDaily) tableData = sortBy(tableData, row => row.date);

		if (isMonthly) tableData = sortBy(sortBy(tableData, row => row.month), row => row.year);

		tableData.forEach(row => {
			const tableRow = { ...row };

			if (isDaily) tableRow.date = moment(tableRow.date).format('ll');

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

		displayTableData = this.formatTableData(displayTableData);
		return displayTableData;
	};

	getTableFooter = (data, tableHeader) => {
		const displayFooterData = { ...data };
		Object.keys(displayFooterData).forEach(key => {
			const newkey = key.replace('total_', '');
			displayFooterData[newkey] = displayFooterData[key];
			delete displayFooterData[key];
		});
		displayFooterData[tableHeader[0].accessor] = 'Total';
		return displayFooterData;
	};

	updateTableData = tableData => {
		let grandTotal = {};
		let tableHeader = [];
		let tableBody = [];
		if (tableData.columns && tableData.result.length > 0) {
			const { columns, result, total } = tableData;
			tableHeader = this.getTableHeaders(columns);
			tableBody = this.getTableBody(result);
			grandTotal = this.getTableFooter(total, tableHeader);
			this.setCsvData({ tableBody, tableHeader, grandTotal });
		}
		return { tableBody, tableHeader, grandTotal };
	};

	formatTableData = tableBody => {
		const { metrics } = this.props;

		tableBody.forEach(row => {
			Object.keys(row).forEach(col => {
				if (metrics[col]) {
					let num;
					switch (metrics[col].valueType) {
						case 'money': {
							num = roundOffTwoDecimal(row[col]);
							row[col] = `$${numberWithCommas(num)}`;

							break;
						}
						case 'percent': {
							num = row[col];
							row[col] = `${numberWithCommas(num)}%`;

							break;
						}
						default: {
							num = row[col];
							row[col] = numberWithCommas(num);
						}
					}
				}
			});
		});

		return tableBody;
	};

	renderFooter() {
		const { tableHeader, grandTotal, metrics } = this.state;
		const footerComponent = [];

		for (let i = 0; i < tableHeader.length; i++) {
			const col = tableHeader[i].accessor;
			let value = grandTotal[col];

			if (metrics[col]) {
				let num;
				switch (metrics[col].valueType) {
					case 'money': {
						num = roundOffTwoDecimal(value);
						value = `$${numberWithCommas(num)}`;

						break;
					}
					case 'percent': {
						num = value;
						value = `${numberWithCommas(num)}%`;

						break;
					}
					default: {
						num = value;
						value = numberWithCommas(num);
					}
				}
			}

			footerComponent.push(
				<td className="tbody-td-default" key={i} style={{ fontWeight: 'bold' }}>
					{value}
				</td>
			);
		}

		return (
			<table className="table table-datatable">
				<tbody className="tbody-default">
					<tr className="tbody-tr-default">{footerComponent}</tr>
				</tbody>
			</table>
		);
	}

	render() {
		const { tableBody, tableHeader, tableData } = this.state;

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
					<ReactTable
						columns={tableHeader}
						data={tableBody}
						defaultPageSize={10}
						pageSizeOptions={[10, 20, 30, 40, 50]}
						minRows={0}
						showPaginationTop
						showPaginationBottom={false}
						className="reporting u-padding-h3 u-padding-v2 -striped -highlight"
					/>
					<Col sm={12}>{this.renderFooter()}</Col>
				</React.Fragment>
			);
		return '';
	}
}
export default Table;
