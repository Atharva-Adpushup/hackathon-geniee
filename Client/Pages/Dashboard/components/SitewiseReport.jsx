import React from 'react';
import Datatable from 'react-bs-datatable';
import { numberWithCommas } from '../helpers/utils';

class SitewiseReport extends React.Component {
	state = {
		tableHeader: [],
		tableBody: []
	};

	componentDidMount() {
		let { displayData } = this.props;
		this.computeTableData(displayData);
	}

	formatTableData = tableBody => {
		const { metrics } = this.props;
		tableBody.forEach(row => {
			for (let col in row) {
				if (metrics[col]) {
					let num = row[col];
					row[col] =
						metrics[col]['valueType'] == 'money'
							? '$' + numberWithCommas(num.toFixed(2))
							: numberWithCommas(num);
				}
			}
		});
	};

	computeTableData = data => {
		const { result, columns } = data;
		const tableHeader = [];
		const { metrics, site, reportType } = this.props;
		columns.forEach(col => {
			if (metrics[col])
				tableHeader.push({
					title: metrics[col].display_name,
					prop: col,
					position: metrics[col].position + 1
				});
		});
		if (reportType === 'site')
			tableHeader.push({
				title: 'Date',
				prop: 'date',
				position: 1
			});
		else
			tableHeader.push({
				title: 'Website',
				prop: 'siteName',
				position: 1
			});
		tableHeader.sort((a, b) => a.position - b.position);
		result.forEach(row => {
			const { siteid } = row;
			row['siteName'] = site[siteid]
				? React.cloneElement(<a href={`/reports/${siteid}`}>{site[siteid]['siteName']}</a>)
				: 'Not Found';
		});
		this.formatTableData(result);
		this.setState({ tableHeader, tableBody: result, isLoading: false });
	};

	renderTable() {
		const { tableBody, tableHeader } = this.state;
		return (
			<Datatable
				tableHeader={tableHeader}
				tableBody={tableBody}
				rowsPerPage={10}
				rowsPerPageOption={[20, 30, 40, 50]}
				keyName="reportTable"
			/>
		);
	}

	render() {
		return this.renderTable();
	}
}

export default SitewiseReport;
