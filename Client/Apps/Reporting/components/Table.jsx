import React from 'react';
import Datatable from 'react-bs-datatable';
import { sortBy } from 'lodash';

class Table extends React.Component {
	state = {
		dimension: this.props.dimension,
		metrics: this.props.metrics,
		tableData: this.props.tableData,
		tableHeader: [],
		tableBody: []
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

	updateTableData = () => {
		const { dimension, metrics, tableData } = this.state;
		if (tableData.columns && tableData.result.length > 0) {
			let tableHeader = [];
			const grandTotal = tableData.total;
			const tableBody = tableData.result;
			const headers = tableData.columns;
			headers.forEach(header => {
				if (dimension[header]) {
					tableHeader.push({
						title: dimension[header].display_name,
						position: dimension[header].position,
						prop: header
					});
				}
				if (metrics[header]) {
					tableHeader.push({
						title: metrics[header].display_name,
						position: metrics[header].position,
						prop: header
					});
				}
				if (header === 'date') {
					tableHeader.push({
						title: 'Date',
						position: 0,
						prop: 'date'
					});
				}
			});
			tableHeader = sortBy(tableHeader, header => header.position);
			Object.keys(grandTotal).forEach(key => {
				const newkey = key.replace('total_', '');
				grandTotal[newkey] = grandTotal[key];
				delete grandTotal[key];
			});
			grandTotal[tableHeader[0].prop] = 'Total';
			tableBody.push(grandTotal);
			this.setState({ tableBody, tableHeader });
		}
	};

	render() {
		const { tableBody, tableHeader } = this.state;
		return (
			<Datatable
				tableHeader={tableHeader}
				tableBody={tableBody}
				keyName="reportTable"
				rowsPerPage={10}
				rowsPerPageOption={[20, 30, 40, 50]}
			/>
		);
	}
}
export default Table;
