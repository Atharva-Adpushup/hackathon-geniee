import React from 'react';
import CustomReactTable from '../../../Components/CustomReactTable/index';

import {
	getWidgetValidDationState,
	formatTableData,
	sortHeadersByPosition
} from '../helpers/utils';
import { reactTableSortMethod } from '../../../helpers/commonFunctions';

function computeTableData(data, props) {
	const { result, columns } = data;
	const tableHeader = [];
	const { metrics } = props;

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
			Header: 'UTM parameter',
			accessor: 'utm_key'
		});

		tableHeader.splice(1, 0, {
			Header: 'Value',
			accessor: 'utm_value'
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

class TopUTMReport extends React.Component {
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

export default TopUTMReport;
