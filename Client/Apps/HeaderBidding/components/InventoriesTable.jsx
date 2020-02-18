import React from 'react';
import CustomReactTable from '../../../Components/CustomReactTable/index';
import { Checkbox } from '@/Client/helpers/react-bootstrap-imports';
import { INVENTORY_TABLE_COLUMNS } from '../constants/index';

function getHeader(
	handleSelectAllInventories,
	handleInventorySelect,
	selectAllInventories,
	selectedInventories,
	checked,
	handleNativeChange
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
			Cell: ({ original: { adUnitId } }) => (
				<Checkbox
					checked={selectedInventories.indexOf(adUnitId) > -1}
					onChange={e => handleInventorySelect(e, adUnitId)}
				/>
			),
			sortable: false,
			filterable: false,
			width: 50,
			maxWidth: 50,
			minWidth: 50
		},
		...INVENTORY_TABLE_COLUMNS,
		{
			Header: 'Multi-format Options',
			Cell: () => (
				<React.Fragment>
					<Checkbox
						checked={checked}
						onChange={handleNativeChange}
						// onChange={e => console.log(e.target.checked)}
					>
						Native
					</Checkbox>
					<Checkbox checked={checked}>video</Checkbox>
				</React.Fragment>
			)
		}
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
	selectedInventories,
	checked,
	handleNativeChange
}) => (
	<CustomReactTable
		columns={getHeader(
			handleSelectAllInventories,
			handleInventorySelect,
			selectAllInventories,
			selectedInventories,
			checked,
			handleNativeChange
		)}
		data={getBody(inventories)}
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
