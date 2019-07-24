import React from 'react';
// import Datatable from 'react-bs-datatable';
import { sortBy, groupBy } from 'lodash';
import moment from 'moment';

import {
	DataTypeProvider,
	TreeDataState,
	SortingState,
	PagingState,
	CustomTreeData,
	IntegratedSorting,
	IntegratedPaging
} from '@devexpress/dx-react-grid';
import {
	Grid,
	Table as Datatable,
	TableHeaderRow,
	TableTreeColumn,
	PagingPanel
} from '@devexpress/dx-react-grid-bootstrap3';
import {
	numberWithCommas,
	computeCsvData,
	calculateTotalPageViews,
	calculateTotalImpressions,
	calculateTotalNetRevenues,
	calculatePageRpm,
	calculateAdeCpm
} from '../helpers/utils';

const getChildRows = (row, rootRows) => (row ? row.items : rootRows);

const CurrencyFormatter = ({ value }) => `$${numberWithCommas(value.toFixed(2))}`;
const NumberFormatter = ({ value }) => numberWithCommas(value);
const CurrencyTypeProvider = props => (
	<DataTypeProvider formatterComponent={CurrencyFormatter} {...props} />
);

const NumberTypeProvider = props => (
	<DataTypeProvider formatterComponent={NumberFormatter} {...props} />
);

const TableRow = ({ row, ...restProps }) => (
	<Datatable.Row {...restProps} style={{ fontWeight: row.id == 'total' ? 'bold' : 'normal' }} />
);
const TotalTableRow = ({ row, ...restProps }) => (
	<Datatable.Row {...restProps} style={{ fontWeight: 'bold' }} />
);

class Table extends React.Component {
	constructor(props) {
		super(props);
		const { tableHeader, tableBody, grandTotal } = this.updateTableData();
		const { tableData } = props;
		this.state = {
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
						name: 'siteName'
					});
				} else {
					tableHeader.push({
						title: dimension[header].display_name,
						position: 1,
						name: header
					});
				}
			}
			if (metrics[header]) {
				tableHeader.push({
					title: metrics[header].display_name,
					position: metrics[header].position + 1,
					name: header,
					sortable: true
				});
			}
		});
		tableHeader.push({
			title: 'Date',
			position: 0,
			name: 'date'
		});
		tableHeader = sortBy(tableHeader, header => header.position);
		return tableHeader;
	};

	getTableBody = tableBody => {
		let tableData = [...tableBody];
		const displayTableData = [];
		const { selectedInterval, site, selectedDimension } = this.props;
		tableData = this.getSortedTableData(tableData);
		if (selectedDimension && selectedInterval == 'daily') {
			const groupByResult = groupBy(tableData, 'date');

			Object.keys(groupByResult).forEach((results, index) => {
				const {
					totalImpressions,
					totalNetRevenue,
					totalPageRpm,
					totalPageviews,
					totalAdeCpm
				} = this.getParentRowGroupedTableData(groupByResult[results]);
				const parentRow = {
					id: index,
					adpushup_page_views: totalPageviews,
					adpushup_page_cpm: totalPageRpm,
					network_ad_ecpm: totalAdeCpm,
					network_net_revenue: totalNetRevenue,
					network_impressions: totalImpressions,
					date: this.formatDailyDate(results),
					[selectedDimension]: '',
					items: this.formatTableGroupChildData(groupByResult[results])
				};
				displayTableData.push(parentRow);
			});
		} else {
			tableData.forEach(row => {
				const tableRow = { ...row };
				const { date, month, year } = tableRow;
				if (selectedInterval === 'daily') tableRow.date = this.formatDailyDate(date);
				if (selectedInterval === 'monthly') tableRow.date = this.formatMonthlyDate(month, year);
				if (selectedInterval === 'cumulative') tableRow.date = this.formatCumulativeDate();
				if (tableRow.siteid) {
					const { siteid } = tableRow;
					tableRow.siteName = site[siteid]
						? React.cloneElement(<a href={`/reports/${siteid}`}>{site[siteid].siteName}</a>)
						: 'Not Found';
					delete tableRow.siteid;
				}
				displayTableData.push(tableRow);
			});
		}
		// displayTableData = this.formatTableData(displayTableData);
		return displayTableData;
	};

	getSortedTableData = tableData => {
		const { selectedInterval } = this.props;
		if (selectedInterval === 'daily') return sortBy(tableData, row => row.date);
		if (selectedInterval === 'monthly')
			return sortBy(sortBy(tableData, row => row.month), row => row.year);
		return tableData;
	};

	getParentRowGroupedTableData = groupByRows => {
		const pageViews = groupByRows.map(groupByRow => groupByRow.adpushup_page_views);
		const impressions = groupByRows.map(groupByRow => groupByRow.network_impressions);
		const netRevenue = groupByRows.map(groupByRow => groupByRow.network_net_revenue);
		const totalPageviews = calculateTotalPageViews(pageViews);
		const totalImpressions = calculateTotalImpressions(impressions);
		const totalNetRevenue = calculateTotalNetRevenues(netRevenue);
		const totalPageRpm = calculatePageRpm(totalNetRevenue, totalPageviews);
		const totalAdeCpm = calculateAdeCpm(totalNetRevenue, totalImpressions);
		return { totalImpressions, totalNetRevenue, totalPageRpm, totalPageviews, totalAdeCpm };
	};

	formatDailyDate = date => moment(date).format('ll');

	formatMonthlyDate = (month, year) => {
		const { startDate, endDate } = this.props;
		let formatedDate;
		if (month == moment(startDate).format('M') && year == moment(startDate).format('Y')) {
			formatedDate = `${moment(startDate).format('ll')} to ${moment(startDate)
				.endOf('month')
				.format('ll')}`;
		} else if (month == moment(endDate).format('M') && year == moment(endDate).format('Y')) {
			formatedDate = `${moment(endDate)
				.startOf('month')
				.format('ll')} to ${moment(endDate).format('ll')}`;
		} else {
			const fromDate = moment([year, month - 1]);
			const toDate = moment(fromDate).endOf('month');
			formatedDate = `${fromDate.format('ll')} to ${toDate.format('ll')}`;
		}
		return formatedDate;
	};

	formatCumulativeDate = () => {
		const { startDate, endDate } = this.props;
		return `${moment(startDate).format('ll')} to ${moment(endDate).format('ll')}`;
	};

	getTableFooter = (data, tableHeader) => {
		const displayFooterData = { ...data };
		Object.keys(displayFooterData).forEach(key => {
			const newkey = key.replace('total_', '');
			displayFooterData[newkey] = displayFooterData[key];
			delete displayFooterData[key];
		});
		displayFooterData[tableHeader[0].name] = 'Total';
		displayFooterData.id = 'total';

		return displayFooterData;
	};

	updateTableData = () => {
		const { tableData, selectedDimension, selectedInterval } = this.props;
		let grandTotal = {};
		let tableHeader = [];
		let tableBody = [];
		if (tableData.columns && tableData.result.length > 0) {
			const { columns, result, total } = tableData;
			tableHeader = this.getTableHeaders(columns);
			tableBody = this.getTableBody(result);
			grandTotal = this.getTableFooter(total, tableHeader);
			this.setCsvData({ tableBody, tableHeader, grandTotal });
			if (!selectedDimension || selectedInterval != 'daily') tableBody.push(grandTotal);
		}
		return { tableBody, tableHeader, grandTotal };
	};

	formatTableGroupChildData = tableBody => {
		const { selectedDimension } = this.props;
		const formattedTableBody = [...tableBody];
		formattedTableBody.forEach(row => {
			Object.keys(row).forEach(col => {
				if (col === 'date') row[col] = '';
			});
		});
		return sortBy(formattedTableBody, selectedDimension);
	};

	render() {
		const { tableBody, tableHeader, tableData, grandTotal } = this.state;
		const { selectedDimension, selectedInterval } = this.props;
		const tableColumnExtensions = [
			{ columnName: 'date', wordWrapEnabled: true },
			{ columnName: selectedDimension, wordWrapEnabled: true }
		];
		const pageSizes = [10, 20, 40, 0];
		const numberColumns = ['adpushup_page_views', 'network_impressions'];
		const currencyColumns = ['network_net_revenue', 'adpushup_page_cpm', 'network_ad_ecpm'];
		const expandedRowsId = tableBody.map(row => row.id);

		if (tableData && tableData.result && tableData.result.length > 0)
			return (
				<React.Fragment>
					{selectedDimension && selectedInterval == 'daily' ? (
						<React.Fragment>
							<Grid rows={tableBody} columns={tableHeader}>
								<SortingState />
								<CurrencyTypeProvider for={currencyColumns} />
								<NumberTypeProvider for={numberColumns} />
								<TreeDataState defaultExpandedRowIds={expandedRowsId} />
								<IntegratedSorting />
								<CustomTreeData getChildRows={getChildRows} />
								<Datatable columnExtensions={tableColumnExtensions} />
								<TableHeaderRow showSortingControls />
								<TableTreeColumn for="date" />
							</Grid>
							<Grid rows={[grandTotal]} columns={tableHeader}>
								<CurrencyTypeProvider for={currencyColumns} />
								<NumberTypeProvider for={numberColumns} />
								<TreeDataState defaultExpandedRowIds={expandedRowsId} />
								<CustomTreeData getChildRows={getChildRows} />
								<Datatable columnExtensions={tableColumnExtensions} rowComponent={TotalTableRow} />
								<TableTreeColumn for="date" />
							</Grid>
						</React.Fragment>
					) : (
						<Grid rows={tableBody} columns={tableHeader}>
							<SortingState />
							<CurrencyTypeProvider for={currencyColumns} />
							<NumberTypeProvider for={numberColumns} />
							<PagingState defaultCurrentPage={0} defaultPageSize={10} />
							<IntegratedPaging />
							<IntegratedSorting rows={[1, 2, 3, 4]} />
							<Datatable
								className="reports-table"
								rowComponent={TableRow}
								columnExtensions={tableColumnExtensions}
							/>
							<TableHeaderRow showSortingControls />
							<PagingPanel pageSizes={pageSizes} />
						</Grid>
					)}
				</React.Fragment>
			);
		return '';
	}
}
export default Table;
