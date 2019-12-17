import React from 'react';
import ReactTable from 'react-table';
import { Checkbox } from 'react-bootstrap';
import { INVENTORY_TABLE_COLUMNS } from '../constants/index';

function getHeader(
	handleSelectAllInventories,
	handleInventorySelect,
	selectAllInventories,
	selectedInventories
) {
	return [
		{
			Header: (
				<Checkbox
					checked={selectAllInventories}
					onChange={handleSelectAllInventories}
					style={{ float: 'left' }}
				/>
			),
			Cell: ({
				original: {
					adUnit: {
						props: { title }
					}
				}
			}) => (
				<Checkbox
					checked={selectedInventories.indexOf(title) > -1}
					onChange={e => handleInventorySelect(e, title)}
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

function getBody(inventories) {
	return inventories.map(inventory => {
		const inventoryCopy = { ...inventory };

		inventoryCopy.adUnit = <span title={inventoryCopy.adUnit}>{inventoryCopy.adUnit}</span>;

		return inventoryCopy;
	});
}

const InventoriesTable = ({
	inventories,
	handleSelectAllInventories,
	handleInventorySelect,
	selectAllInventories,
	selectedInventories
}) => (
	<ReactTable
		columns={getHeader(
			handleSelectAllInventories,
			handleInventorySelect,
			selectAllInventories,
			selectedInventories
		)}
		data={getBody(inventories)}
		className="-striped -highlight u-padding-h3 u-padding-v2 inventory-table"
		pageSizeOptions={[10, 25, 50, 100]}
		defaultSorting={[
			{
				id: 'adUnit',
				desc: false
			}
		]}
		defaultPageSize={10}
		minRows={0}
	/>
);

export default InventoriesTable;