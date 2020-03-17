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
	columns: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
	data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
	pageSizeOptions: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	defaultPageSize: PropTypes.number,
	minRows: PropTypes.number,
	sortable: PropTypes.bool,
	filterable: PropTypes.bool,
	showPaginationBottom: PropTypes.bool,
	showPaginationTop: PropTypes.bool,
	defaultSorting: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	pivotBy: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};

CustomReactTable.defaultProps = {
	columns: PropTypes.object.isRequired,
	data: PropTypes.object.isRequired
};

export default CustomReactTable;
