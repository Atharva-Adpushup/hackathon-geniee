import React from 'react';
import ReactTable from 'react-table';
import { Checkbox } from 'react-bootstrap';
import { INVENTORY_TABLE_COLUMNS } from '../constants/index';

function getHeader(handleSelectAllInventories, checkedCopy, handleInventorySelect, selectAll) {
	return [
		{
			Header: (
				<Checkbox
					checked={selectAll}
					onChange={handleSelectAllInventories}
					style={{ float: 'left' }}
				/>
			),
			Cell: row => (
				<Checkbox
					checked={checkedCopy[row.index]}
					onChange={e => handleInventorySelect(row.index, e)}
				/>
			),
			sortable: false,
			filterable: false,
			width: 50,
			maxWidth: 50,
			minWidth: 50
		},
		...INVENTORY_TABLE_COLUMNS
	];
}

function getBody(inventories, selectedInventories, handleInventorySelect) {
	return inventories.map(inventory => {
		const inventoryCopy = { ...inventory };

		inventoryCopy.adUnit = (
			<span title={inventoryCopy.adUnit}>
				{inventoryCopy.adUnit.length > 25
					? `${inventoryCopy.adUnit.substring(0, 25)}...`
					: inventoryCopy.adUnit}
			</span>
		);
		inventoryCopy.checkBox = (
			<Checkbox
				checked={selectedInventories.indexOf(inventory.adUnit) > -1}
				onChange={e => handleInventorySelect(e, inventory.adUnit)}
			/>
		);

		return inventoryCopy;
	});
}

function getDefaultPageSize(inventories) {
	const { length } = inventories;

	if (length <= 10) return 10;
	if (length <= 20) return 20;
	if (length <= 50) return 50;
	return 50;
}

const InventoriesTable = ({
	inventories,
	handleSelectAllInventories,
	handleInventorySelect,
	selectedInventories,
	checkedCopy,
	selectAll
}) => (
	<ReactTable
		columns={getHeader(handleSelectAllInventories, checkedCopy, handleInventorySelect, selectAll)}
		data={getBody(inventories, selectedInventories, handleInventorySelect)}
		className="-striped -highlight u-padding-h3 u-padding-v2 inventory-table"
		pageSizeOptions={[10, 25, 50, 100]}
		defaultSorting={[
			{
				id: 'adUnit',
				desc: false
			}
		]}
		defaultPageSize={getDefaultPageSize(inventories)}
	/>
);

export default InventoriesTable;
