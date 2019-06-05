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

		inventoryCopy.checkBox = (
			<Checkbox
				checked={selectedInventories.indexOf(inventoryCopy.tempId) > -1}
				onChange={e => handleInventorySelect(e, inventoryCopy.tempId)}
			/>
		);

		inventoryCopy.headerBidding = inventoryCopy.headerBidding ? 'Enabled' : 'Disabled';
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
		rowsPerPage={5}
		rowsPerPageOption={[5, 10, 15, 20]}
		initialSort={{ prop: 'adUnit', isAscending: true }}
		labels={customLabels}
	/>
);

export default InventoriesTable;
