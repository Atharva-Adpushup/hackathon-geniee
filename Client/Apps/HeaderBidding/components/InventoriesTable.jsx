import React from 'react';
import Datatable from 'react-bs-datatable';
import { Checkbox } from 'react-bootstrap';

function getHeader(handleSelectAllInventories) {
	return [
		{ title: <Checkbox onChange={handleSelectAllInventories} />, prop: 'checkBox' },
		{ title: 'Ad Unit', prop: 'adUnit', sortable: true },
		{ title: 'App', prop: 'app', sortable: true },
		{ title: 'Device', prop: 'device', sortable: true },
		{ title: 'PageGroup', prop: 'pageGroup', sortable: true },
		{ title: 'Variation', prop: 'variationName', sortable: true },
		{ title: 'HB', prop: 'headerBidding', sortable: true }
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

const customLabels = {
	first: '<<',
	last: '>>',
	prev: '<',
	next: '>',
	show: 'Display',
	entries: 'rows',
	noResults: 'There is no data to be displayed'
};

const InventoriesTable = ({
	inventories,
	handleSelectAllInventories,
	handleInventorySelect,
	selectedInventories
}) => (
	<Datatable
		tableHeader={getHeader(handleSelectAllInventories)}
		tableBody={getBody(inventories, selectedInventories, handleInventorySelect)}
		keyName="userTable"
		tableClass="striped hover responsive"
		rowsPerPage={10}
		rowsPerPageOption={[10, 25, 50, 100]}
		initialSort={{ prop: 'adUnit', isAscending: true }}
		labels={customLabels}
	/>
);

export default InventoriesTable;
