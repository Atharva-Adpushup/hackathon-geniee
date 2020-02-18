/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Checkbox } from '@/Client/helpers/react-bootstrap-imports';

import InventoriesTable from './InventoriesTable';
import FilterBox from '../../../Components/FilterBox';
import CustomButton from '../../../Components/CustomButton';
import { getHbStatusForSite, toggleHbStatusForSite } from '../../../services/hbService';
import Loader from '../../../Components/Loader';
import Spinner from '../../../Components/Spinner';
import Empty from '../../../Components/Empty/index';

export default class InventoryTab extends React.Component {
	state = {
		// eslint-disable-next-line react/destructuring-assignment
		filteredInventories: null,
		selectedInventories: [],
		hbStatusForSite: null,
		loadingHbStatusForSite: true,
		updatingInventoryHbStatus: false,
		selectAllInventories: false,
		checked: false
	};

	componentDidMount() {
		const { siteId, inventories } = this.props;
		const { filteredInventories } = this.state;

		const inventoriesCopy = JSON.parse(JSON.stringify(inventories));

		getHbStatusForSite(siteId).then(({ headerBidding: hbStatusForSite }) => {
			const newState = { hbStatusForSite, loadingHbStatusForSite: false };
			if (!filteredInventories && inventories) newState.filteredInventories = inventoriesCopy;

			this.setState(newState);
		});
	}

	componentWillReceiveProps({ inventories }) {
		const inventoriesCopy = JSON.parse(JSON.stringify(inventories));
		const { filteredInventories } = this.state;
		if (!filteredInventories && inventories) {
			return this.setState({ filteredInventories: inventoriesCopy });
		}
		if (filteredInventories && inventories) {
			const { updated, updatedFilteredInventories } = this.getUpdatedFilteredInventories(
				inventoriesCopy
			);

			if (updated) return this.setState({ filteredInventories: updatedFilteredInventories });
		}
	}

	getUpdatedFilteredInventories(inventories) {
		const { filteredInventories } = this.state;
		let updated = false;

		const updatedFilteredInventories = filteredInventories.map(filteredInventory => {
			const matchedInventory = inventories.find(
				inventory => inventory.adUnitId === filteredInventory.adUnitId
			);

			if (!updated && filteredInventory.headerBidding !== matchedInventory.headerBidding) {
				updated = true;
			}

			return matchedInventory;
		});

		return { updated, updatedFilteredInventories };
	}

	handleChange = e => {
		this.setState({ checked: e.target.checked });
	};

	handleNativeChange = () => {
		console.log('hello');
	};

	handleSelectAllInventories = () => {
		const { filteredInventories, selectAllInventories } = this.state;
		const newState = {};
		newState.selectAllInventories = !selectAllInventories;
		newState.selectedInventories = !selectAllInventories
			? [...filteredInventories].map(inventory => inventory.adUnitId)
			: [];

		this.setState(newState);
	};

	handleInventorySelect = (e, adUnitId) => {
		const { checkedCopy, selectedInventories, filteredInventories } = this.state;
		const checked = checkedCopy;
		if (e.target.checked) {
			selectedInventories.push(adUnitId);
		} else {
			selectedInventories.splice(selectedInventories.indexOf(adUnitId), 1);
		}
		this.setState({
			checkedCopy: checked,
			selectedInventories,
			selectAllInventories: selectedInventories.length === filteredInventories.length
		});
	};

	getFilterBoxValues = prop => {
		const { inventories } = this.props;
		const values = [...new Set([...inventories].map(inventory => inventory[prop]))];

		return values.map(value => ({ name: value }));
	};

	handleFilters = filters => {
		const { inventories } = this.props;
		let filteredInventories = [...inventories];

		for (const prop in filters) {
			const filter = filters[prop];
			// eslint-disable-next-line no-continue
			if (!filter.values.length) continue;

			filteredInventories = filteredInventories.filter(
				inventory => filter.values.indexOf(inventory[prop]) > -1
			);
		}

		this.setState({
			filteredInventories,
			selectedInventories: [],
			checkedCopy: [],
			selectAll: false
		});
	};

	updateInventoriesHbStatus = enableHB => {
		this.setState({ updatingInventoryHbStatus: true });
		const {
			inventories,
			siteId,
			updateInventoriesHbStatus,
			showNotification,
			setUnsavedChangesAction
		} = this.props;
		const { selectedInventories } = this.state;

		const inventoriesToUpdate = [];

		for (const inventory of inventories) {
			if (selectedInventories.indexOf(inventory.adUnitId) > -1) {
				inventoriesToUpdate.push({
					...inventory,
					headerBidding: enableHB ? 'Enabled' : 'Disabled'
				});
			}
		}

		updateInventoriesHbStatus(siteId, inventoriesToUpdate)
			.then(() =>
				this.setState({ updatingInventoryHbStatus: false }, () => {
					setUnsavedChangesAction(true);
				})
			)
			.catch(() => {
				showNotification({
					mode: 'error',
					title: 'Error',
					message: 'Unable to update inventories hb status',
					autoDismiss: 5
				});
			});
	};

	toggleHbStatusForSiteState = newHbStatus => {
		const { loadingHbStatusForSite, hbStatusForSite: currHbStatus } = this.state;

		if (loadingHbStatusForSite || newHbStatus === currHbStatus) return false;

		const { siteId, setUnsavedChangesAction } = this.props;
		this.setState({ loadingHbStatusForSite: true });
		return toggleHbStatusForSite(siteId).then(({ headerBidding: hbStatusForSite }) =>
			this.setState({ hbStatusForSite, loadingHbStatusForSite: false }, () =>
				setUnsavedChangesAction(true)
			)
		);
	};

	render() {
		const { inventories } = this.props;
		const {
			filteredInventories,
			selectedInventories,
			hbStatusForSite,
			loadingHbStatusForSite,
			updatingInventoryHbStatus,
			checkedCopy,
			selectAllInventories,
			checked
		} = this.state;

		return (
			<div className="options-wrapper white-tab-container hb-inventories">
				<div className="toggle-hb-status-for-site u-margin-b4 text-right">
					<FontAwesomeIcon
						icon="play"
						className={`icon u-margin-r3${
							hbStatusForSite === null || loadingHbStatusForSite || hbStatusForSite
								? ' disabled'
								: ' active'
						}`}
						title={
							hbStatusForSite === null || loadingHbStatusForSite || hbStatusForSite
								? ''
								: 'Resume Header Bidding'
						}
						onClick={() => this.toggleHbStatusForSiteState(true)}
					/>
					<FontAwesomeIcon
						icon="pause"
						className={`icon u-margin-r3${
							hbStatusForSite === null || loadingHbStatusForSite || hbStatusForSite === false
								? ' disabled'
								: ' active'
						}`}
						title={
							hbStatusForSite === null || loadingHbStatusForSite || hbStatusForSite === false
								? ''
								: 'Pause Header Bidding'
						}
						onClick={() => this.toggleHbStatusForSiteState(false)}
					/>
					{loadingHbStatusForSite && <Spinner color="primary" size={20} />}
				</div>

				{!filteredInventories ? (
					<Loader />
				) : (
					<div className={`inventory-wrap${hbStatusForSite === false ? ' disabled' : ' active'}`}>
						{!!selectedInventories.length && (
							<div className="updt-inv-hb-status u-margin-b4">
								<span className="selected-inv-count u-margin-r3">{`${
									selectedInventories.length
								} selected`}</span>
								<CustomButton
									disabled={updatingInventoryHbStatus}
									variant="secondary"
									type="button"
									onClick={() => this.updateInventoriesHbStatus(true)}
									className="u-margin-r3"
								>
									Enable
								</CustomButton>
								<CustomButton
									disabled={updatingInventoryHbStatus}
									variant="secondary"
									type="button"
									onClick={() => this.updateInventoriesHbStatus(false)}
									className="u-margin-r3"
								>
									Disable
								</CustomButton>
								{updatingInventoryHbStatus && <Spinner color="primary" />}
							</div>
						)}

						{inventories && (
							<FilterBox
								onFilter={this.onFilter}
								availableFilters={[
									{
										name: 'Ad Unit',
										prop: 'adUnit',
										values: this.getFilterBoxValues('adUnit')
									},
									{ name: 'App', prop: 'app', values: this.getFilterBoxValues('app') },
									{
										name: 'Page Group',
										prop: 'pageGroup',
										values: this.getFilterBoxValues('pageGroup')
									},
									{ name: 'Device', prop: 'device', values: this.getFilterBoxValues('device') },
									{
										name: 'Variation',
										prop: 'variationName',
										values: this.getFilterBoxValues('variationName')
									},
									{
										name: 'Header Bidding',
										prop: 'headerBidding',
										values: this.getFilterBoxValues('headerBidding')
									}
								]}
								handleFilters={this.handleFilters}
								className="u-margin-b5 inventory-tab"
							/>
						)}

						<Checkbox
							onChange={this.handleChange}
							checked={checked}
							disabled={checked ? true : false}
						>
							Enable native and video format for all units
						</Checkbox>

						{!filteredInventories.length ? (
							<Empty message="No Data Found" />
						) : (
							filteredInventories && (
								<InventoriesTable
									inventories={filteredInventories}
									selectedInventories={selectedInventories}
									handleInventorySelect={this.handleInventorySelect}
									handleSelectAllInventories={this.handleSelectAllInventories}
									checkedCopy={checkedCopy}
									checked={checked}
									handleNativeChange={this.handleNativeChange}
									selectAllInventories={selectAllInventories}
								/>
							)
						)}
					</div>
				)}
			</div>
		);
	}
}
