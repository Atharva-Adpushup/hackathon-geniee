/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import InventoriesTable from './InventoriesTable';
import FilterBox from '../../../Components/FilterBox';
import CustomButton from '../../../Components/CustomButton';
import {
	getHbStatusForSite,
	toggleHbStatusForSite,
	updateFormat
} from '../../../services/hbService';
import Loader from '../../../Components/Loader';
import Spinner from '../../../Components/Spinner';
import Empty from '../../../Components/Empty/index';
import CustomToggleSwitch from '../../../Components/CustomToggleSwitch';
import axios from '../../../helpers/axiosInstance';

export default class InventoryTab extends React.Component {
	state = {
		// eslint-disable-next-line react/destructuring-assignment
		filteredInventories: null,
		selectedInventories: [],
		hbStatusForSite: null,
		loadingHbStatusForSite: true,
		updatingInventoryHbStatus: false,
		selectAllInventories: false,
		selectAllMultiFormat: false,
		selectAllNative: [],
		selectAllVideo: []
	};

	componentDidMount() {
		const { siteId, inventories } = this.props;
		const { filteredInventories, selectAllNative, selectAllVideo } = this.state;

		const inventoriesCopy = JSON.parse(JSON.stringify(inventories));

		getHbStatusForSite(siteId).then(({ headerBidding: hbStatusForSite }) => {
			const newState = { hbStatusForSite, loadingHbStatusForSite: false };
			if (!filteredInventories && inventories) newState.filteredInventories = inventoriesCopy;

			this.setState(newState);
		});

		inventories.forEach(inventory => {
			const { networkData = {}, adUnitId } = inventory;

			const { formats = [] } = networkData;

			if (formats.includes('native')) {
				selectAllNative.push(adUnitId);
			}
			if (formats.includes('video')) {
				selectAllVideo.push(adUnitId);
			}
		});

		this.setState({
			selectAllNative,
			selectAllVideo,
			selectAllMultiFormat: !!(
				selectAllNative.length === inventories.length &&
				selectAllVideo.length === inventories.length
			)
		});
	}

	componentWillReceiveProps({ inventories }) {
		const inventoriesCopy = JSON.parse(JSON.stringify(inventories));
		const { filteredInventories } = this.state;
		if (!filteredInventories && inventories) {
			this.setState({ filteredInventories: inventoriesCopy });
		}
		if (filteredInventories && inventories) {
			const { updated, updatedFilteredInventories } = this.getUpdatedFilteredInventories(
				inventoriesCopy
			);

			if (updated) this.setState({ filteredInventories: updatedFilteredInventories });
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

	handleBulkFormatToggle = isEnabled => {
		const { selectAllMultiFormat } = this.state;
		const { siteId, inventories, showNotification, customProps, user } = this.props;
		const newState = {};
		newState.selectAllMultiFormat = !selectAllMultiFormat;
		newState.selectAllNative = !selectAllMultiFormat
			? [...inventories].map(inventory => inventory.adUnitId)
			: [];
		newState.selectAllVideo = !selectAllMultiFormat
			? [...inventories].map(inventory => inventory.adUnitId)
			: [];

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: user.sites[siteId].domain
		};

		updateFormat(
			inventories.map(v => ({ ...v, checked: isEnabled, format: 'native' })),
			siteId,
			dataForAuditLogs
		)
			.then(() =>
				updateFormat(
					inventories.map(v => ({ ...v, checked: isEnabled, format: 'video' })),
					siteId,
					dataForAuditLogs
				)
			)
			.then(() =>
				showNotification({
					mode: 'success',
					title: 'Success',
					message: `All Inventories ${isEnabled ? 'enabled' : 'disabled'} successfully`,
					autoDismiss: 5
				})
			)
			.catch(() =>
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: 'Something went wrong',
					autoDismiss: 5
				})
			);

		this.setState(newState);
	};

	handleNativeChange = ({ target: { checked } }, params) => {
		const { adUnitId, app, pageGroup, device } = params;
		const { selectAllNative, selectAllVideo } = this.state;
		const {
			siteId,
			showNotification,
			inventories,
			setUnsavedChangesAction,
			customProps,
			user
		} = this.props;
		const format = 'native';
		const inventoryToUpdate = [];
		const jsonTopush = { checked, format, adUnitId, app, pageGroup, device };
		inventoryToUpdate.push(jsonTopush);

		if (checked) {
			selectAllNative.push(adUnitId);
		} else {
			selectAllNative.splice(selectAllNative.indexOf(adUnitId), 1);
		}

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: user.sites[siteId].domain
		};

		return updateFormat(inventoryToUpdate, siteId, dataForAuditLogs)
			.then(() => {
				this.setState(
					{
						selectAllNative,
						selectAllMultiFormat:
							selectAllNative.length === inventories.length &&
							selectAllVideo.length === inventories.length
					},
					() => setUnsavedChangesAction(true)
				);
			})
			.catch(() =>
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: 'Something went wrong',
					autoDismiss: 5
				})
			);
	};

	handleVideoChange = ({ target: { checked } }, params) => {
		const { adUnitId, app, pageGroup, device } = params;
		const { selectAllVideo, selectAllNative } = this.state;
		const { siteId, inventories, showNotification, customProps, user } = this.props;
		const format = 'video';
		const inventoryToUpdate = [];
		const jsonTopush = { checked, format, adUnitId, app, pageGroup, device };
		inventoryToUpdate.push(jsonTopush);

		if (checked) {
			selectAllVideo.push(adUnitId);
		} else {
			selectAllVideo.splice(selectAllVideo.indexOf(adUnitId), 1);
		}

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: user.sites[siteId].domain
		};

		return updateFormat(inventoryToUpdate, siteId, dataForAuditLogs)
			.then(() => {
				this.setState({
					selectAllVideo,
					selectAllMultiFormat: !!(
						selectAllNative.length === inventories.length &&
						selectAllVideo.length === inventories.length
					)
				});
			})
			.catch(() =>
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: 'Something went wrong',
					autoDismiss: 5
				})
			);
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
			checkedCopy: []
		});
	};

	updateInventoriesHbStatus = enableHB => {
		this.setState({ updatingInventoryHbStatus: true });
		const {
			inventories,
			siteId,
			updateInventoriesHbStatus,
			showNotification,
			setUnsavedChangesAction,
			customProps,
			user
		} = this.props;

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: user.sites[siteId].domain
		};

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

		updateInventoriesHbStatus(siteId, inventoriesToUpdate, dataForAuditLogs)
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
		const { siteId, user, customProps } = this.props;

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: user.sites[siteId].domain
		};

		if (loadingHbStatusForSite || newHbStatus === currHbStatus) return false;

		const { setUnsavedChangesAction } = this.props;
		this.setState({ loadingHbStatusForSite: true });
		return toggleHbStatusForSite(siteId, dataForAuditLogs).then(
			({ headerBidding: hbStatusForSite }) =>
				this.setState({ hbStatusForSite, loadingHbStatusForSite: false }, () =>
					setUnsavedChangesAction(true)
				)
		);
	};

	toggleBulkEnableRefresh = isEnabled => {
		const { siteId, showNotification, customProps, user } = this.props;

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: user.sites[siteId].domain
		};

		return axios
			.put(`/headerBidding/updateRefresh/${siteId}`, { refreshStatus: isEnabled, dataForAuditLogs })
			.then(() =>
				showNotification({
					mode: 'success',
					title: 'Success',
					message: `All Inventories refresh ${isEnabled ? 'enabled' : 'disabled'} successfully`,
					autoDismiss: 5
				})
			)
			.catch(e =>
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: e.message || 'Something went wrong',
					autoDismiss: 5
				})
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
			selectAllMultiFormat,
			selectAllVideo,
			selectAllNative
		} = this.state;

		const doesAllHaveRefresh = inventories.every(
			inv => inv.networkData && inv.networkData.refreshSlot
		);

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

						<CustomToggleSwitch
							layout="horizontal"
							className="u-margin-b4"
							checked={selectAllMultiFormat}
							onChange={this.handleBulkFormatToggle}
							labelText="Enable or Disable Video and Native on all units"
							labelBold
							on="Enable"
							off="Disable"
							defaultLayout
							name="toggle-multiformat"
							id="toggle-multiformat"
						/>

						<CustomToggleSwitch
							layout="horizontal"
							className="u-margin-b4"
							checked={doesAllHaveRefresh}
							onChange={this.toggleBulkEnableRefresh}
							labelText="Enable or Disable Refresh on all units"
							labelBold
							on="Enable"
							off="Disable"
							defaultLayout
							name="toggle-refresh"
							id="toggle-refresh"
						/>

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
									handleNativeChange={this.handleNativeChange}
									handleVideoChange={this.handleVideoChange}
									selectAllInventories={selectAllInventories}
									selectAllVideo={selectAllVideo}
									selectAllNative={selectAllNative}
								/>
							)
						)}
					</div>
				)}
			</div>
		);
	}
}
