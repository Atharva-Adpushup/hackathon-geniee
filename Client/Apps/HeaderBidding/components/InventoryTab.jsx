import React from 'react';
import InventoriesTable from './InventoriesTable';
import AddFilter from './AddFilter';

export default class BiddersTab extends React.Component {
	state = {
		// eslint-disable-next-line react/destructuring-assignment
		filteredInventories: null,
		selectedInventories: []
	};

	componentDidMount() {
		const { siteId, fetchInventoriesAction } = this.props;
		fetchInventoriesAction(siteId);
	}

	static getDerivedStateFromProps(props, state) {
		if (!state.filteredInventories && props.inventories) {
			return {
				filteredInventories: props.inventories
			};
		}

		return null;
	}

	handleSelectAllInventories = ({ target: { checked } }) => {
		this.setState(state => {
			const { filteredInventories, selectedInventories } = state;

			if (
				checked &&
				filteredInventories &&
				filteredInventories.length !== selectedInventories.length
			) {
				return { selectedInventories: [...filteredInventories].map(inventory => inventory.tempId) };
			}

			if (!checked && selectedInventories.length) {
				return { selectedInventories: [] };
			}

			return null;
		});
	};

	handleInventorySelect = ({ target: { checked } }, tempId) => {
		this.setState(state => {
			if (checked) {
				if (state.selectedInventories.indexOf(tempId) > -1) return null;
				return { selectedInventories: [...state.selectedInventories, tempId] };
			}

			const index = state.selectedInventories.indexOf(tempId);
			if (index === -1) return null;

			const selectedInventoriesCopy = [...state.selectedInventories];
			selectedInventoriesCopy.splice(index, 1);
			return { selectedInventories: selectedInventoriesCopy };
		});
	};

	render() {
		const { inventories } = this.props;
		const { filteredInventories, selectedInventories } = this.state;

		return (
			<div className="options-wrapper hb-inventories">
				<AddFilter
					onFilter={this.onFilter}
					titles={[
						{ title: 'Ad Unit', associatedProp: 'adUnit' },
						{ title: 'App', associatedProp: 'app' },
						{ title: 'Page Group', associatedProp: 'pageGroup' },
						{ title: 'Device', associatedProp: 'device' },
						{ title: 'Variation', associatedProp: 'variationName' }
					]}
					values={inventories}
				/>
				{filteredInventories && (
					<InventoriesTable
						inventories={filteredInventories}
						selectedInventories={selectedInventories}
						handleInventorySelect={this.handleInventorySelect}
						handleSelectAllInventories={this.handleSelectAllInventories}
					/>
				)}
			</div>
		);
	}
}
