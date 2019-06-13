import React from 'react';
import Datatable from 'react-bs-datatable';
import { Col } from 'react-bootstrap';
import { sortBy } from 'lodash';
import moment from 'moment';
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
	numberWithCommas = x => {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	};

	formatTableData = tableBody => {
		const { metrics } = this.state;
		tableBody.forEach(row => {
			for (let col in row) {
				if (metrics[col]) {
					let num = Math.round(row[col] * 100) / 100;
					row[col] = this.numberWithCommas(num);
				}
			}
		});
		return tableBody;
	};

	updateTableData = () => {
		const { dimension, metrics, tableData } = this.state;
		const { selectedInterval, startDate, endDate } = this.props;
		if (tableData.columns && tableData.result.length > 0) {
			let tableHeader = [];
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
				if (selectedInterval === 'daily') row.date = moment(row.date).format('ll');
				if (selectedInterval === 'monthly') {
					if (row.month == startDate.format('M') && row.year == startDate.format('Y')) {
						row.date = startDate.format('ll') + ' to ' + startDate.endOf('month').format('ll');
					} else if (row.month == endDate.format('M') && row.year == endDate.format('Y')) {
						row.date = endDate.startOf('month').format('ll') + ' to ' + endDate.format('ll');
					} else {
						let fromDate = moment([row.year, row.month - 1]);
						let toDate = moment(fromDate).endOf('month');
						row.date = fromDate.format('ll') + ' to ' + toDate.format('ll');
					}
				}
				if (selectedInterval === 'cumulative')
					row.date = startDate.format('ll') + ' to ' + endDate.format('ll');
			});

			Object.keys(grandTotal).forEach(key => {
				const newkey = key.replace('total_', '');
				grandTotal[newkey] = grandTotal[key];
				delete grandTotal[key];
			});
			grandTotal[tableHeader[0].prop] = 'Total';
			//tableBody.push(grandTotal);
			tableBody = this.formatTableData(tableBody);
			this.setState({ tableBody, tableHeader, grandTotal });
		}
	};
	renderFooter() {
		let { tableHeader, grandTotal } = this.state;
		let footerComponent = [];
		for (let i = 0; i < tableHeader.length; i++) {
			let value = grandTotal[tableHeader[i].prop];
			if (typeof value == 'number') {
				value = Math.round(value * 100) / 100;
				value = this.numberWithCommas(value);
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
