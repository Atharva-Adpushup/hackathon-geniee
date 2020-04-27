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
	defaultSorted,
	defaultSortMethod,
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
		defaultSorted={defaultSorted}
		pivotBy={pivotBy}
		defaultSortMethod={defaultSortMethod}
		className="u-padding-h3 u-padding-v2 -striped -highlight"
	>
		{/* To calculate total number of records present */}

		{(state, makeTable, instance) => {
			let recordsInfoText = '';

			const { filtered, pageRows, pageSize, sortedData, page } = state;

			if (sortedData && sortedData.length > 0) {
				const isFiltered = filtered.length > 0;

				const totalRecords = sortedData.length;

				const recordsCountFrom = page * pageSize + 1;

				const recordsCountTo = recordsCountFrom + pageRows.length - 1;

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
	defaultSorted: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	defaultSortMethod: PropTypes.func,
	pivotBy: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};

CustomReactTable.defaultProps = {
	columns: PropTypes.object.isRequired,
	data: PropTypes.object.isRequired
};

export default CustomReactTable;
