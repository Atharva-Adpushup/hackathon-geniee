/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InventoriesTable from './InventoriesTable';
import FilterBox from '../../../Components/FilterBox';
import CustomButton from '../../../Components/CustomButton';
import { getHbStatusForSite, toggleHbStatusForSite } from '../../../services/hbService';
import Loader from '../../../Components/Loader';
import Spinner from '../../../Components/Spinner';

export default class InventoryTab extends React.Component {
	state = {
		// eslint-disable-next-line react/destructuring-assignment
		filteredInventories: null,
		selectedInventories: [],
		hbStatusForSite: null,
		loadingHbStatusForSite: true,
		updatingInventoryHbStatus: false
	};

	componentDidMount() {
		const { siteId, fetchInventoriesAction } = this.props;

		fetchInventoriesAction(siteId);
		getHbStatusForSite(siteId).then(({ headerBidding: hbStatusForSite }) => {
			this.setState({ hbStatusForSite, loadingHbStatusForSite: false });
		});
	}

	componentWillReceiveProps({ inventories }) {
		const { filteredInventories } = this.state;
		if (!filteredInventories && inventories) {
			this.setState({ filteredInventories: inventories });
		}
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

		this.setState({ filteredInventories });
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
			if (selectedInventories.indexOf(inventory.tempId) > -1) {
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
			updatingInventoryHbStatus
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
								className="u-margin-b5"
							/>
						)}

						{filteredInventories && (
							<InventoriesTable
								inventories={filteredInventories}
								selectedInventories={selectedInventories}
								handleInventorySelect={this.handleInventorySelect}
								handleSelectAllInventories={this.handleSelectAllInventories}
							/>
						)}
					</div>
				)}
			</div>
		);
	}
}
