import React from 'react';
import Datatable from 'react-bs-datatable';
import { Col } from 'react-bootstrap';
import { sortBy } from 'lodash';
import moment from 'moment';
import { numberWithCommas } from '../helpers/utils';
class Table extends React.Component {
	state = {
		dimension: this.props.dimension,
		metrics: this.props.metrics,
		tableData: this.props.tableData,
		tableHeader: [],
		tableBody: [],
		grandTotal: {}
	};

	componentDidMount() {
		this.updateTableData();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.tableData !== this.props.tableData) {
			this.setState(
				{
					tableData: this.props.tableData
				},
				this.updateTableData
			);
		}
	}

	formatTableData = tableBody => {
		const { metrics } = this.state;
		tableBody.forEach(row => {
			for (let col in row) {
				if (metrics[col]) {
					let num = Math.round(row[col] * 100) / 100;
					row[col] = numberWithCommas(num);
				}
			}
		});
		return tableBody;
	};

	updateTableData = () => {
		let { dimension, metrics, tableData } = this.state;
		const { selectedInterval, startDate, endDate, getTableData } = this.props;
		if (tableData.columns && tableData.result.length > 0) {
			let tableHeader = [];
			let displayTableData = [];
			const grandTotal = tableData.total;
			let tableBody = tableData.result;
			const headers = tableData.columns;
			headers.forEach(header => {
				if (dimension[header]) {
					tableHeader.push({
						title: dimension[header].display_name,
						position: 1,
						prop: header
					});
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
			if (selectedInterval === 'daily') tableBody = sortBy(tableBody, row => row.date);
			if (selectedInterval === 'monthly')
				tableBody = sortBy(sortBy(tableBody, row => row.month), row => row.year);
			tableBody.forEach(row => {
				let tableRow = { ...row };
				if (selectedInterval === 'daily') tableRow.date = moment(tableRow.date).format('ll');
				if (selectedInterval === 'monthly') {
					if (
						tableRow.month == moment(startDate).format('M') &&
						tableRow.year == moment(startDate).format('Y')
					) {
						tableRow.date =
							moment(startDate).format('ll') +
							' to ' +
							moment(startDate)
								.endOf('month')
								.format('ll');
					} else if (
						tableRow.month == moment(endDate).format('M') &&
						tableRow.year == moment(endDate).format('Y')
					) {
						tableRow.date =
							moment(endDate)
								.startOf('month')
								.format('ll') +
							' to ' +
							moment(endDate).format('ll');
					} else {
						let fromDate = moment([tableRow.year, tableRow.month - 1]);
						let toDate = moment(fromDate).endOf('month');
						tableRow.date = fromDate.format('ll') + ' to ' + toDate.format('ll');
					}
				}
				if (selectedInterval === 'cumulative')
					row.date = moment(startDate).format('ll') + ' to ' + moment(endDate).format('ll');
				displayTableData.push(tableRow);
			});

			Object.keys(grandTotal).forEach(key => {
				const newkey = key.replace('total_', '');
				if (metrics[newkey]) {
					let num = Math.round(grandTotal[key] * 100) / 100;
					grandTotal[newkey] = numberWithCommas(num);
				} else grandTotal[newkey] = grandTotal[key];
				delete grandTotal[key];
			});
			grandTotal[tableHeader[0].prop] = 'Total';

			displayTableData = this.formatTableData(displayTableData);
			this.setState({ tableBody: displayTableData, tableHeader, grandTotal }, () => {
				getTableData({ tableBody: displayTableData, tableHeader, grandTotal });
			});
		}
	};
	renderFooter() {
		let { tableHeader, grandTotal } = this.state;
		let footerComponent = [];
		for (let i = 0; i < tableHeader.length; i++) {
			let value = grandTotal[tableHeader[i].prop];
			if (typeof value == 'number') {
				value = Math.round(value * 100) / 100;
				value = numberWithCommas(value);
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
				if (typeof columnValue === 'string') return parseFloat(columnValue.replace(/,/g, ''));
				else return columnValue;
			},
			adpushup_page_views(columnValue) {
				if (typeof columnValue === 'string') return parseFloat(columnValue.replace(/,/g, ''));
				else return columnValue;
			},
			network_impressions(columnValue) {
				if (typeof columnValue === 'string') return parseFloat(columnValue.replace(/,/g, ''));
				else return columnValue;
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
		else return '';
	}
}
export default Table;
