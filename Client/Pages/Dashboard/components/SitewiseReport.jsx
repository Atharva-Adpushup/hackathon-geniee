import React from 'react';
import Datatable from 'react-bs-datatable';
import { numberWithCommas, roundOffTwoDecimal, getWidgetValidDationState } from '../helpers/utils';

function formatTableData(tableBody, props) {
	const { metrics } = props;

	tableBody.forEach(row => {
		for (const col in row) {
			if (metrics[col]) {
				const num = row[col];

				row[col] =
					metrics[col].valueType == 'money'
						? `$${numberWithCommas(roundOffTwoDecimal(num))}`
						: numberWithCommas(num);
			}
		}
	});
}

function computeTableData(data, props) {
	const { result, columns } = data;
	const tableHeader = [];
	const { metrics, site, reportType } = props;

	if ((result, columns)) {
		columns.forEach(col => {
			if (metrics[col]) {
				tableHeader.push({
					title: metrics[col].display_name,
					prop: col,
					position: metrics[col].position + 1
				});
			}
		});

		if (reportType === 'site') {
			tableHeader.push({
				title: 'Date',
				prop: 'date',
				position: 1
			});
		} else {
			tableHeader.push({
				title: 'Website',
				prop: 'siteName',
				position: 1
			});
		}

		tableHeader.sort((a, b) => a.position - b.position);
		result.forEach(row => {
			const { siteid } = row;
			row.siteName = site[siteid]
				? React.cloneElement(<a href={`/reports/${siteid}`}>{site[siteid].siteName}</a>)
				: 'Not Found';
		});

		formatTableData(result, props);
	}

	const computedState = { tableHeader, tableBody: result || [] };
	return computedState;
}

const DEFAULT_STATE = {
	tableHeader: [],
	tableBody: []
};

class SitewiseReport extends React.Component {
	state = DEFAULT_STATE;

	static getDerivedStateFromProps(props) {
		const { displayData } = props;
		const { isValid, isValidAndEmpty } = getWidgetValidDationState(displayData);

		if (!isValid) {
			return null;
		}

		if (isValidAndEmpty) {
			return DEFAULT_STATE;
		}

		const computedState = computeTableData(displayData, props);
		return { ...computedState };
	}

	renderTable() {
		const { tableBody, tableHeader } = this.state;
		return tableBody && tableBody.length > 0 ? (
			<Datatable
				tableHeader={tableHeader}
				tableBody={tableBody}
				rowsPerPage={10}
				rowsPerPageOption={[20, 30, 40, 50]}
				keyName="reportTable"
			/>
		) : (
			<div className="text-center">No Record Found.</div>
		);
	}

	render() {
		return this.renderTable();
	}
}

export default SitewiseReport;
