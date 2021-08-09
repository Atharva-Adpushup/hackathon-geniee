import React from 'react';
import CustomReactTable from '../../../Components/CustomReactTable/index';

import {
	getWidgetValidDationState,
	formatTableData,
	sortHeadersByPosition
} from '../helpers/utils';
import { reactTableSortMethod } from '../../../helpers/commonFunctions';

function computeTableData(data, props) {
	let { result, columns } = data;
	const tableHeader = [];
	const { metrics, site = {}, disableSiteLevelCheck } = props;

	if ((result, columns)) {
		const sortedHeaders = sortHeadersByPosition(columns, metrics);

		sortedHeaders.forEach(({ Header, accessor }) => {
			tableHeader.push({
				Header,
				accessor,
				sortMethod: (a, b) => reactTableSortMethod(a, b)
			});
		});

		tableHeader.splice(0, 0, {
			Header: 'Website',
			accessor: 'siteName'
		});

		tableHeader.splice(1, 0, {
			Header: 'URL',
			accessor: 'url'
		});

		result = result.map(row => {
			const { siteid, siteName, url } = row;
			const isSiteIdInReportSites = !!(site[siteid] || disableSiteLevelCheck);
			const computedSiteName = (site[siteid] && site[siteid].siteName) || siteName;
			row.siteName = isSiteIdInReportSites
				? React.cloneElement(<a href={`/reports/${siteid}`}>{computedSiteName}</a>)
				: 'Not Found';
			row.url = React.cloneElement(
				<a
					target="_blank"
					rel="noopener noreferrer"
					href={`https://${url}`}
					style={{ textDecoration: 'underline', color: '#1E90FF' }}
				>
					{url}
				</a>
			);
			return row;
		});

		formatTableData(result, metrics);
	}

	const computedState = { tableHeader, tableBody: result || [] };
	return computedState;
}

const DEFAULT_STATE = {
	tableHeader: [],
	tableBody: []
};

class TopURLReport extends React.Component {
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
			<CustomReactTable
				columns={tableHeader}
				data={tableBody}
				showPaginationTop
				showPaginationBottom={false}
				pageSizeOptions={[10, 20, 30, 40, 50]}
				defaultPageSize={10}
				minRows={0}
			/>
		) : (
			<div className="text-center">No Record Found.</div>
		);
	}

	render() {
		return this.renderTable();
	}
}

export default TopURLReport;
