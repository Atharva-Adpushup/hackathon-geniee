import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import './style.scss';
import PropTypes from 'prop-types';

const CustomReactTable = ({
	columns,
	data,
	pageSizeOptions,
	defaultPageSize,
	minRows,
	sortable,
	filterable,
	showPaginationTop,
	showPaginationBottom,
	defaultSorting,
	pivotBy
}) => (
	<ReactTable
		columns={columns}
		data={data}
		pageSizeOptions={pageSizeOptions}
		defaultPageSize={defaultPageSize}
		minRows={minRows}
		sortable={sortable}
		filterable={filterable}
		showPaginationTop={showPaginationTop}
		showPaginationBottom={showPaginationBottom}
		defaultSorting={defaultSorting}
		pivotBy={pivotBy}
		className="u-padding-h3 u-padding-v2 -striped -highlight"
	>
		{/* To calculate total number of records present */}

		{(state, makeTable, instance) => {
			let recordsInfoText = '';

			const { filtered, pageRows, pageSize, sortedData, page } = state;

			if (sortedData && sortedData.length > 0) {
				let isFiltered = filtered.length > 0;

				let totalRecords = sortedData.length;

				let recordsCountFrom = page * pageSize + 1;

				let recordsCountTo = recordsCountFrom + pageRows.length - 1;

				if (isFiltered)
					recordsInfoText = `${recordsCountFrom}-${recordsCountTo} of ${totalRecords} filtered records`;
				else recordsInfoText = `${recordsCountFrom}-${recordsCountTo} of ${totalRecords} records`;
			} else recordsInfoText = 'No records';

			return (
				<div className="main-grid">
					<div className="above-table text-right">
						<div className="col-sm-12">
							<span className="records-info">{recordsInfoText} </span>
						</div>
					</div>

					{makeTable()}
				</div>
			);
		}}
	</ReactTable>
);

CustomReactTable.propTypes = {
	columns: PropTypes.object.isRequired,
	data: PropTypes.object.isRequired,
	pageSizeOptions: PropTypes.object.isRequired,
	defaultPageSize: PropTypes.number.isRequired,
	minRows: PropTypes.number.isRequired,
	sortable: PropTypes.bool.isRequired,
	filterable: PropTypes.bool.isRequired,
	showPaginationBottom: PropTypes.bool.isRequired,
	showPaginationTop: PropTypes.bool.isRequired,
	defaultSorting: PropTypes.object.isRequired,
	pivotBy: PropTypes.object.isRequired
};

CustomReactTable.defaultProps = {
	columns: PropTypes.object.isRequired,
	data: PropTypes.object.isRequired
};

export default CustomReactTable;
