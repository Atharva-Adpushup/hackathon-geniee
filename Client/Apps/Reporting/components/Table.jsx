import React from 'react';
import ReactTable from 'react-table';
import { Col } from 'react-bootstrap';
import sortBy from 'lodash/sortBy';
import moment from 'moment';
import { numberWithCommas, computeCsvData, roundOffTwoDecimal } from '../helpers/utils';

class Table extends React.Component {
	constructor(props) {
		super(props);
		const { tableHeader, tableBody, grandTotal } = this.updateTableData();
		const { metrics, tableData } = props;
		this.state = {
			metrics,
			tableData,
			tableHeader,
			tableBody,
			grandTotal
		};
	}

	shouldComponentUpdate() {
		return false;
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
		const { metrics, dimension } = this.props;
		const { isDaily } = this.getDateIntervalValidators();

		headers.forEach(header => {
			if (dimension[header]) {
				if (header === 'siteid') {
					tableHeader.splice(0, 0, {
						Header: 'Site Name',
						accessor: 'siteName',
						sortable: true
					});
				} else {
					tableHeader.splice(0, 0, {
						Header: dimension[header].display_name,
						accessor: header,
						sortable: true
					});
				}
			}

			if (metrics[header]) {
				tableHeader.splice(metrics[header].position + 1, 0, {
					Header: metrics[header].display_name,
					accessor: header,
					sortable: true
				});
			}
		});
		let computedDate = {
			Header: 'Date',
			accessor: 'date'
		};

		if (isDaily) {
			computedDate = { ...computedDate, sortable: true };
		}

		tableHeader.unshift(computedDate);
		tableHeader = sortBy(tableHeader, header => header.position);

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
				if (
					tableRow.month == moment(startDate).format('M') &&
					tableRow.year == moment(startDate).format('Y')
				) {
					tableRow.date = `${moment(startDate).format('ll')} to ${moment(startDate)
						.endOf('month')
						.format('ll')}`;
				} else if (
					tableRow.month == moment(endDate).format('M') &&
					tableRow.year == moment(endDate).format('Y')
				) {
					tableRow.date = `${moment(endDate)
						.startOf('month')
						.format('ll')} to ${moment(endDate).format('ll')}`;
				} else {
					const fromDate = moment([tableRow.year, tableRow.month - 1]);
					const toDate = moment(fromDate).endOf('month');
					tableRow.date = `${fromDate.format('ll')} to ${toDate.format('ll')}`;
				}
			}

			if (isCumulative)
				tableRow.date = `${moment(startDate).format('ll')} to ${moment(endDate).format('ll')}`;

			if (tableRow.siteid) {
				const { siteid } = tableRow;

				tableRow.siteName = site[siteid]
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

	updateTableData = () => {
		const { tableData } = this.props;
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
					const num = metrics[col].valueType === 'money' ? roundOffTwoDecimal(row[col]) : row[col];
					row[col] =
						metrics[col].valueType === 'money'
							? `$${numberWithCommas(num)}`
							: numberWithCommas(num);
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
				const num = metrics[col].valueType == 'money' ? roundOffTwoDecimal(value) : value;
				value =
					metrics[col].valueType == 'money' ? `$${numberWithCommas(num)}` : numberWithCommas(num);
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
						pageSizeOptions={[20, 30, 40, 50]}
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
