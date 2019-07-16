import React from 'react';
import Datatable from 'react-bs-datatable';
import { Col } from 'react-bootstrap';
import { sortBy } from 'lodash';
import moment from 'moment';
import { numberWithCommas, computeCsvData } from '../helpers/utils';

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

	getTableHeaders = headers => {
		let tableHeader = [];
		const { metrics, dimension } = this.props;
		headers.forEach(header => {
			if (dimension[header]) {
				if (header == 'siteid') {
					tableHeader.push({
						title: 'Site Name',
						position: 1,
						prop: 'siteName'
					});
				} else {
					tableHeader.push({
						title: dimension[header].display_name,
						position: 1,
						prop: header
					});
				}
			}
			if (metrics[header]) {
				tableHeader.push({
					title: metrics[header].display_name,
					position: metrics[header].position + 1,
					prop: header,
					sortable: true
				});
			}
		});
		tableHeader.push({
			title: 'Date',
			position: 0,
			prop: 'date'
		});
		tableHeader = sortBy(tableHeader, header => header.position);
		return tableHeader;
	};

	getTableBody = tableBody => {
		let tableData = [...tableBody];
		let displayTableData = [];
		const { selectedInterval, startDate, endDate, site } = this.props;
		if (selectedInterval === 'daily') tableData = sortBy(tableData, row => row.date);
		if (selectedInterval === 'monthly')
			tableData = sortBy(sortBy(tableData, row => row.month), row => row.year);
		tableData.forEach(row => {
			const tableRow = { ...row };
			if (selectedInterval === 'daily') tableRow.date = moment(tableRow.date).format('ll');
			if (selectedInterval === 'monthly') {
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
			if (selectedInterval === 'cumulative')
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
		displayFooterData[tableHeader[0].prop] = 'Total';
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
					const num = metrics[col].valueType === 'money' ? row[col].toFixed(2) : row[col];
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
			const col = tableHeader[i].prop;
			let value = grandTotal[col];
			if (metrics[col]) {
				const num = metrics[col].valueType == 'money' ? value.toFixed(2) : value;
				value =
					metrics[col].valueType == 'money' ? `$${numberWithCommas(num)}` : numberWithCommas(num);
			}

			footerComponent.push(
				<td className="tbody-td-default" style={{ fontWeight: 'bold' }}>
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
			}
		};
		if (tableData && tableData.result && tableData.result.length > 0)
			return (
				<React.Fragment>
					<Datatable
						tableHeader={tableHeader}
						tableBody={tableBody}
						keyName="reportTable"
						rowsPerPage={10}
						rowsPerPageOption={[20, 30, 40, 50]}
						onSort={onSortFunction}
					/>
					<Col sm={12}>{this.renderFooter()}</Col>
				</React.Fragment>
			);
		return '';
	}
}
export default Table;
