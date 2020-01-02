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
	/>
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
