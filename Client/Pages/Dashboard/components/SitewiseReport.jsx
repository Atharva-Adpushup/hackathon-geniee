import React from 'react';
import moment from 'moment';
import sortBy from 'lodash/sortBy';
import CustomReactTable from '../../../Components/CustomReactTable/index';

import { numberWithCommas, roundOffTwoDecimal, getWidgetValidDationState } from '../helpers/utils';
import { reactTableSortMethod } from '../../../helpers/commonFunctions';

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

function sortHeadersByPosition(columns, metrics) {
	const tempArr = [];
	columns.forEach(col => {
		if (metrics[col]) {
			tempArr.push({
				Header: metrics[col].display_name,
				accessor: col,
				position: metrics[col].table_position
			});
		}
	});

	return sortBy(tempArr, o => o.position);
}

function computeTableData(data, props) {
	const { result, columns } = data;
	const tableHeader = [];
	const { metrics, site = {}, reportType, disableSiteLevelCheck } = props;

	if ((result, columns)) {
		const sortedHeaders = sortHeadersByPosition(columns, metrics);

		sortedHeaders.forEach(({ Header, accessor }) => {
			tableHeader.push({
				Header,
				accessor,
				sortMethod: (a, b) => reactTableSortMethod(a, b)
			});
		});

		if (reportType === 'site') {
			tableHeader.splice(0, 0, {
				Header: 'Date',
				accessor: 'date',
				Cell: props => <span>{moment(props.value).format('ll')}</span>
			});
		} else {
			tableHeader.splice(0, 0, {
				Header: 'Website',
				accessor: 'siteName'
			});
		}

		result.forEach(row => {
			const { siteid, siteName } = row;
			const isSiteIdInReportSites = !!(site[siteid] || disableSiteLevelCheck);
			const computedSiteName = (site[siteid] && site[siteid].siteName) || siteName;

			row.siteName = isSiteIdInReportSites
				? React.cloneElement(<a href={`/reports/${siteid}`}>{computedSiteName}</a>)
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
		const onSortFunction = {
			network_net_revenue(columnValue) {
				if (typeof columnValue === 'string') return parseFloat(columnValue.replace(/[,$]/g, ''));
				return columnValue;
			},
			network_gross_revenue(columnValue) {
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

export default SitewiseReport;
