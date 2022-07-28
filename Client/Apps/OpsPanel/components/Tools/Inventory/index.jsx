/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-alert */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import clonedeep from 'lodash/cloneDeep';
import { Prompt } from 'react-router-dom';
import { Checkbox, Badge, Modal } from '@/Client/helpers/react-bootstrap-imports';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import has from 'lodash/has';
import 'react-table/react-table.css';
import CustomReactTable from '../../../../../Components/CustomReactTable/index';
import CustomButton from '../../../../../Components/CustomButton/index';
import Loader from '../../../../../Components/Loader';
import AsyncGroupSelect from '../../../../../Components/AsyncGroupSelect';
import config from '../../../../../config/config';
import SelectBox from '../../../../../Components/SelectBox';
import AdUnitSettings from './AdUnitSettings';
import {
	INVENTORY_BULK_ACTIONS,
	AD_UNIT_TYPE_MAPPING,
	FILTER_KEY_VALUE_MAPPING
} from '../../../configs/commonConsts';

class AdunitsInventory extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// store it in redux
			filteredAds: [],
			isLoading: true,
			modalShow: false,
			selectedFilters: {},
			adUnitLevelAction: {},
			isAllUnitSelected: false,
			selectedAdUnits: {},
			bulkActionName: null,
			filterList: config.ADMIN_INVENTORY_LIST_FILTER_LIST,
			tableHeader: config.ADMIN_INVENTORY_LIST_TABLE_HEADER,
			hasUnsavedChanges: false,
			isDefaultStateSet: false,
			globalAdUnitSize: config.BULK_DEFAULT_AD_UNIT_SIZE,
			modalData: {},
			adUnitSizeActions: {},
			oldAdUnitSizes: {}
		};
		this.filterValueOptions = {};
	}

	componentDidMount() {
		const { sites, isInventoryFetched, fetchGlobalData, fetchInventoryTabAllAdUnits } = this.props;
		if (!sites.fetched) {
			fetchGlobalData();
		}
		if (!isInventoryFetched) {
			fetchInventoryTabAllAdUnits();
		}
	}

	static getDerivedStateFromProps(props, state) {
		const { allAds = [], isInventoryFetched } = props;
		if (isInventoryFetched && !state.isDefaultStateSet) {
			return { ...state, filteredAds: allAds, isDefaultStateSet: true };
		}
		return state;
	}

	onFilterChange = selectedFilters => {
		const { allAds } = this.props;
		const { filterList } = this.state;

		const filteredAdList = [];

		const selectedFilterKeys = Object.keys(selectedFilters);

		const isSelectedFilterEmpty = selectedFilterKeys.reduce((acc, curr) => {
			const filter = selectedFilters[curr];
			const keys = Object.keys(filter);
			return !keys.length && acc;
		}, true);

		if (isSelectedFilterEmpty) {
			this.setState({
				filterList,
				filteredAds: allAds,
				selectedFilters: { ...selectedFilters },
				selectedAdUnits: {},
				isAllUnitSelected: false,
				adUnitLevelAction: {},
				bulkActionName: null
			});
			return;
		}

		for (let adIndex = 0; adIndex < allAds.length; adIndex += 1) {
			const ad = allAds[adIndex];
			let isValid = true;
			for (let index = 0; index < selectedFilterKeys.length; index += 1) {
				const filterKey = selectedFilterKeys[index];
				const filter = selectedFilters[filterKey] || {};
				const filterValues = Object.keys(filter);
				let adValue = ad[filterKey];
				if (filterValues.length) {
					switch (filterKey) {
						case 'adUnitType': {
							adValue = `${adValue}`;
							break;
						}
						default:
					}
					if (!filterValues.includes(adValue)) {
						isValid = false;
					}
					if (!isValid) break;
				}
			}
			if (isValid) {
				filteredAdList.push(ad);
			}
		}
		this.setState(state => ({
			...state,
			filteredAds: filteredAdList,
			selectedFilters: { ...selectedFilters },
			selectedAdUnits: {},
			isAllUnitSelected: false,
			adUnitLevelAction: {},
			bulkActionName: null
		}));
	};

	getSelectedFilter = filter =>
		new Promise(resolve => {
			const { allAds } = this.props;
			const response = { data: { result: [] }, status: 200 };
			const { key } = filter;
			const { filterValueOptions } = this;
			if (filterValueOptions[key]) {
				return resolve(filterValueOptions[key]);
			}

			const uniqueSet = new Set();

			const allPossibleValues = allAds.reduce((allValues, ad) => {
				let value = null;
				switch (key) {
					case 'adUnitType': {
						value = AD_UNIT_TYPE_MAPPING[ad[key]];
						if (value && !uniqueSet.has(value)) {
							allValues.push({ id: ad[key], value });
							uniqueSet.add(value);
							return allValues;
						}
						break;
					}
					default:
						value = ad[key];
				}
				if (value && !uniqueSet.has(value)) {
					allValues.push({ id: value, value });
					uniqueSet.add(value);
				}
				return allValues;
			}, []);

			response.data.result = allPossibleValues;
			this.filterValueOptions[key] = response;
			return resolve(response);
		});

	getTableHeaders = columns => {
		const sortedColumns = sortBy(clonedeep(columns), ['position']);
		return sortedColumns.map(column => {
			const { Header, accessor, width = 150, maxWidth = 300, minWidth = 150 } = column;
			const commonProps = { accessor, width, maxWidth, minWidth };
			if (accessor === 'adUnitSettings') {
				return {
					Header,
					className: 'inventory-actions-bulk-dropdown',
					...commonProps,
					maxWidth: 300,
					minWidth: 300,
					width: 300
				};
			}
			return {
				Header,
				...commonProps
			};
		});
	};

	toggleAdUnitSelect = (adId, adSize) => () => {
		const {
			selectedAdUnits,
			adUnitLevelAction,
			bulkActionName,
			adUnitSizeActions,
			globalAdUnitSize
		} = this.state;
		const { isInvalidSizeEntered } = this;
		const isAdUnitSelected = !selectedAdUnits[adId];
		if (!isAdUnitSelected) {
			adUnitLevelAction[adId] = null;
			if (bulkActionName === 'disable-downwardSizesDisabled') {
				// here how to handle if invalid is entered
				adUnitSizeActions[adId] = null;
			}
		} else {
			if (bulkActionName === 'disable-downwardSizesDisabled') {
				if (isInvalidSizeEntered(adId, adSize, globalAdUnitSize)) {
					// here how to handle if invalid is entered
					return;
				}
				if (
					globalAdUnitSize.maxWidth !== '' ||
					globalAdUnitSize.maxHeight !== '' ||
					globalAdUnitSize.minWidth !== '' ||
					globalAdUnitSize.minHeight !== ''
				) {
					adUnitSizeActions[adId] = globalAdUnitSize;
				}
			}
			adUnitLevelAction[adId] = bulkActionName;
		}
		selectedAdUnits[adId] = isAdUnitSelected;

		this.setState({
			selectedAdUnits: { ...selectedAdUnits },
			hasUnsavedChanges: true,
			bulkActionName,
			adUnitLevelAction,
			adUnitSizeActions: { ...adUnitSizeActions }
		});
	};

	handleSiteActionSelect = (adId, extraMetaData) => value => {
		const {
			selectedAdUnits,
			adUnitLevelAction,
			bulkActionName,
			adUnitSizeActions,
			globalAdUnitSize,
			filteredAds
		} = this.state;
		let isAllUnitSelected = false;
		if (adUnitLevelAction[adId] === value) return;
		if (!value || value !== 'disable-downwardSizesDisabled') {
			adUnitSizeActions[adId] = null;
		}

		if (value === bulkActionName) {
			if (bulkActionName !== 'disable-downwardSizesDisabled') {
				selectedAdUnits[adId] = true;
			} else {
				// check here if sizefilters is same as globalAdUnitSize
				let sizeFilters = adUnitLevelAction[adId] || {};
				if (!Object.keys(sizeFilters).length) {
					const { height, width } = extraMetaData;
					sizeFilters = { maxHeight: height, minHeight: height, maxWidth: width, minWidth: width };
				}
				if (isEqual(sizeFilters, globalAdUnitSize)) {
					selectedAdUnits[adId] = true;
				}
			}
		} else {
			selectedAdUnits[adId] = false;
		}
		const selectedAdsIds = Object.keys(selectedAdUnits);
		const selectedAdsLength = selectedAdsIds.reduce((count, id) => {
			if (selectedAdUnits[id]) return count + 1;
			return count;
		}, 0);
		if (filteredAds.length === selectedAdsLength) {
			isAllUnitSelected = true;
		} else {
			isAllUnitSelected = false;
		}

		this.setState({
			adUnitLevelAction: {
				...adUnitLevelAction,
				[adId]: value
			},
			hasUnsavedChanges: true,
			selectedAdUnits: { ...selectedAdUnits },
			isAllUnitSelected,
			adUnitSizeActions: { ...adUnitSizeActions }
		});
	};

	getTableBody = data =>
		data.map(row => {
			const { selectedAdUnits, adUnitLevelAction, adUnitSizeActions } = this.state;
			const { toggleAdUnitSelect, handleSiteActionSelect } = this;
			const rowCopy = clonedeep(row);
			const { height, width } = rowCopy;
			let { sizeFilters = {} } = rowCopy;
			const { adId } = row;
			if (adUnitSizeActions[adId]) {
				sizeFilters = adUnitSizeActions[adId];
			} else if (!Object.keys(sizeFilters).length) {
				sizeFilters = { maxHeight: height, minHeight: height, maxWidth: width, minWidth: width };
			}
			const columnKeys = Object.keys(rowCopy);
			for (let index = 0; index < columnKeys.length; index += 1) {
				const columnKey = columnKeys[index];
				if (columnKey === 'adUnitSettings') {
					rowCopy[columnKey] = (
						<div className="mt-10">
							<SelectBox
								id="inventory-actions-bulk-update"
								key="inventory-actions-bulk-update"
								isClearable={false}
								isSearchable={false}
								wrapperClassName="custom-select-box-wrapper"
								reset
								selected={adUnitLevelAction[adId] || null}
								title="Ad Actions"
								options={INVENTORY_BULK_ACTIONS}
								onSelect={handleSiteActionSelect(adId, { height, width })}
							/>
						</div>
					);
				} else if (columnKey === 'siteId') {
					rowCopy[columnKey] = (
						<Checkbox
							checked={!!selectedAdUnits[adId]}
							onChange={toggleAdUnitSelect(adId, { height, width })}
						>
							{rowCopy[columnKey]}
						</Checkbox>
					);
				} else if (columnKey === 'adUnitAction') {
					rowCopy[columnKey] = (
						<div className="mt-10">
							<CustomButton
								disabled={adUnitLevelAction[adId] !== 'disable-downwardSizesDisabled'}
								type="button"
								onClick={this.openAdSettingsModal({
									type: 'adUnit',
									sizeFilters,
									adId
								})}
							>
								Edit Config
							</CustomButton>
						</div>
					);
				} else {
					rowCopy[columnKey] = <div className="mt-10">{rowCopy[columnKey]}</div>;
				}
			}
			return rowCopy;
		});

	toggleSelectAllAdUnits = () => {
		const {
			isAllUnitSelected,
			adUnitLevelAction,
			bulkActionName,
			filteredAds,
			globalAdUnitSize,
			adUnitSizeActions
		} = this.state;
		const { allAdsMap } = this.props;
		const { isInvalidSizeEntered } = this;
		let selectedAdUnits = [];
		let isInvalidSelection = false;
		if (!isAllUnitSelected) {
			selectedAdUnits = filteredAds.reduce((acc, curr) => {
				const { adId } = curr;
				acc[adId] = true;
				adUnitLevelAction[adId] = bulkActionName;
				const { height, width } = allAdsMap[adId];
				if (bulkActionName === 'disable-downwardSizesDisabled') {
					if (isInvalidSizeEntered(adId, { height, width }, globalAdUnitSize)) {
						isInvalidSelection = true;
					} else adUnitSizeActions[adId] = globalAdUnitSize;
				} else {
					adUnitSizeActions[adId] = null;
				}
				return acc;
			}, {});
		} else {
			filteredAds.forEach(ad => {
				const { adId } = ad;
				adUnitLevelAction[adId] = null;
				adUnitSizeActions[adId] = null;
			});
		}
		if (isInvalidSelection) return;
		this.setState({
			selectedAdUnits: { ...selectedAdUnits },
			isAllUnitSelected: !isAllUnitSelected,
			hasUnsavedChanges: true,
			adUnitLevelAction
		});
	};

	handleBulkActionSelect = value => {
		const { selectedAdUnits, adUnitLevelAction, adUnitSizeActions } = this.state;
		let { globalAdUnitSize } = this.state;
		const selectedAdsIds = Object.keys(selectedAdUnits);
		for (let index = 0; index < selectedAdsIds.length; index += 1) {
			const key = selectedAdsIds[index];
			if (selectedAdUnits[key]) adUnitLevelAction[key] = value;
			if (value !== 'disable-downwardSizesDisabled') {
				adUnitSizeActions[key] = null;
			}
		}
		if (value !== 'disable-downwardSizesDisabled') {
			globalAdUnitSize = config.BULK_DEFAULT_AD_UNIT_SIZE;
		}
		this.setState({
			bulkActionName: value,
			adUnitLevelAction: { ...adUnitLevelAction },
			hasUnsavedChanges: true,
			adUnitSizeActions: { ...adUnitSizeActions },
			globalAdUnitSize: { ...globalAdUnitSize }
		});
	};

	giveSelectedFilterDom = (filterData, filterKey) => {
		const filterName = FILTER_KEY_VALUE_MAPPING[filterKey];
		let values = Object.keys(filterData);
		if (filterKey === 'adUnitType') {
			values = values.map(value => AD_UNIT_TYPE_MAPPING[value]);
		}
		if (!values.length) {
			return null;
		}
		return (
			<div key={filterKey}>
				<div>{filterName}:</div>
				<div>
					{values.map(value => (
						<Badge className="filter-pill" key={value}>
							{value}
						</Badge>
					))}
				</div>
			</div>
		);
	};

	handleRemoveAllFilters = () => {
		const { allAds } = this.props;
		this.setState({
			selectedFilters: {},
			adUnitLevelAction: {},
			selectedAdUnits: {},
			filteredAds: [...allAds],
			isAllUnitSelected: false,
			bulkActionName: null
		});
	};

	seggragateAdsByDoc = (updatedAds, isCurrentUpdatedState) => {
		const { adUnitSizeActions } = this.state;
		const { allAdsMap } = this.props;
		const adsByDocId = updatedAds.reduce((accAds, adUpdateData) => {
			const { adId, enable } = adUpdateData;
			const adData = allAdsMap[adId];
			const { docId } = adData;
			if (!accAds[docId]) {
				accAds[docId] = [];
			}
			if (
				(has(adUpdateData, 'downwardSizesDisabled') ||
					adUpdateData.actionValue === 'downwardSizesDisabled') &&
				!enable &&
				adUnitSizeActions[adId]
			) {
				// if sizeFilters value has changed than only we will need it for audit logs

				if (isCurrentUpdatedState) {
					adUpdateData.sizeFilters = { ...adUnitSizeActions[adId] };
				} else {
					const ad = allAdsMap[adId];
					adUpdateData.sizeFilters = { ...ad.sizeFilters };
				}
			}
			accAds[docId].push(adUpdateData);
			return accAds;
		}, {});
		return adsByDocId;
	};

	getUpdatedAds = updatedAdsIds => {
		const { adUnitLevelAction } = this.state;
		const adsToBeUpdated = updatedAdsIds.reduce((allAds, adId) => {
			const value = adUnitLevelAction[adId];
			let actionValue = null;
			let enable = null;
			if (value) {
				if (value.includes('enable-')) {
					actionValue = value.replace('enable-', '');
					enable = true;
				} else {
					actionValue = value.replace('disable-', '');
					enable = false;
				}
				allAds.push({ adId, actionValue, enable });
			}
			return allAds;
		}, []);
		return adsToBeUpdated;
	};

	getAuditLogsData = (updatedAds = []) => {
		const { allAdsMap } = this.props;

		const newAdConfig = updatedAds.map(ad => {
			const { actionValue, enable, adId } = ad;
			return { [actionValue]: enable, adId };
		});
		const oldAdConfig = updatedAds.map(ad => {
			const { actionValue, adId } = ad;
			return { [actionValue]: allAdsMap[adId][actionValue], adId };
		});
		return { newAdConfig, oldAdConfig };
	};

	handleMasterSave = () => {
		const confirmationMessage = window.confirm('Are you sure you want to save the changes?');
		if (!confirmationMessage) {
			return;
		}
		let { dataForAuditLogs } = this.props;
		const { adUnitLevelAction, adUnitSizeActions } = this.state;
		const { seggragateAdsByDoc, getUpdatedAds, getAuditLogsData } = this;
		const allAdsIds = Object.keys(adUnitLevelAction);
		const updatedAds = getUpdatedAds(allAdsIds);

		const seggragatedAds = seggragateAdsByDoc(updatedAds, true);
		const { newAdConfig, oldAdConfig } = getAuditLogsData(updatedAds);
		const oldConfigSeggragated = seggragateAdsByDoc(oldAdConfig);
		const newConfigSeggragated = seggragateAdsByDoc(newAdConfig, true);
		const { updateInventoryTabAdUnits } = this.props;

		dataForAuditLogs = {
			...dataForAuditLogs,
			actionInfo: 'Inventory Tab Ad Unit Update',
			oldConfig: oldConfigSeggragated,
			newConfig: newConfigSeggragated
		};
		// console.log({ seggragatedAds, adUnitLevelAction, dataForAuditLogs });
		updateInventoryTabAdUnits({
			seggragatedAds,
			adUnitLevelAction,
			dataForAuditLogs,
			adUnitSizeActions
		});
	};

	modalToggle = value => {
		const { modalShow } = this.state;
		this.setState({
			modalShow: value || !modalShow
		});
	};

	openAdSettingsModal = modalData => () => {
		const { oldAdUnitSizes } = this.state;
		const { adId, type, sizeFilters } = modalData;
		if (type === 'adUnit') {
			oldAdUnitSizes[adId] = sizeFilters;
		}
		this.setState({ modalData: { ...modalData }, oldAdUnitSizes: { ...oldAdUnitSizes } }, () =>
			this.modalToggle()
		);
	};

	isInvalidSizeEntered = (adId, adSize, sizeFilters) => {
		const { width, height } = adSize;
		const { showNotification } = this.props;

		if (height && (sizeFilters.minHeight > height || sizeFilters.maxHeight > height)) {
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: `Min/Max Height can not be more than ad unit height for Ad:${adId}`,
				autoDismiss: 5
			});
		}
		if (width && (sizeFilters.minWidth > width || sizeFilters.maxWidth > width)) {
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: `Min/Max Width can not be more than ad unit width for Ad:${adId}`,
				autoDismiss: 5
			});
		}
		return false;
	};

	onAdSizeSettingsSave = data => {
		const { isInvalidSizeEntered } = this;
		const { sizeFilters, type, adId } = data;
		const { adUnitSizeActions, oldAdUnitSizes, selectedAdUnits, globalAdUnitSize } = this.state;
		const { allAdsMap } = this.props;
		if (type === 'global') {
			if (
				data.maxWidth !== '' ||
				data.maxHeight !== '' ||
				data.minWidth !== '' ||
				data.minHeight !== ''
			) {
				const updatedAdUnitSizeActions = {};
				const selectedAdUnitsIds = Object.keys(selectedAdUnits);
				for (let index = 0; index < selectedAdUnitsIds.length; index += 1) {
					const id = selectedAdUnitsIds[index];
					if (selectedAdUnits[id]) {
						const ad = allAdsMap[id];
						const { height, width, docId } = ad;
						const docType = docId.substr(0, 4);
						const adSize = { height, width };
						if (docType !== 'aplt') {
							if (isInvalidSizeEntered(id, adSize, sizeFilters)) {
								// here how to handle if invalid is entered
								return;
							}
							updatedAdUnitSizeActions[id] = sizeFilters;
						}
					}
				}
				this.setState({
					adUnitSizeActions: { ...adUnitSizeActions, ...updatedAdUnitSizeActions },
					globalAdUnitSize: { ...sizeFilters }
				});
			}
		} else {
			const ad = allAdsMap[adId];
			const { height, width, docId } = ad;
			const docType = docId.substr(0, 4);
			if (docType !== 'aplt') {
				const adSize = { height, width };
				const initialSizes = oldAdUnitSizes[adId];
				if (isInvalidSizeEntered(adId, adSize, sizeFilters)) return;
				if (
					initialSizes.minHeight !== sizeFilters.minHeight ||
					initialSizes.maxHeight !== sizeFilters.maxHeight ||
					initialSizes.minWidth !== sizeFilters.minWidth ||
					initialSizes.maxWidth !== sizeFilters.maxWidth
				) {
					adUnitSizeActions[adId] = sizeFilters;
				}
				selectedAdUnits[adId] = isEqual(sizeFilters, globalAdUnitSize);
				this.setState({
					adUnitSizeActions: { ...adUnitSizeActions },
					selectedAdUnits: { ...selectedAdUnits }
				});
			}
		}
		this.modalToggle(false);
	};

	render() {
		const {
			filterList,
			tableHeader,
			filteredAds,
			bulkActionName,
			isAllUnitSelected,
			hasUnsavedChanges,
			selectedFilters,
			modalShow,
			globalAdUnitSize,
			modalData
		} = this.state;
		const { showNotification, isInventoryFetched } = this.props;

		const selectedFilterKeys = Object.keys(selectedFilters);

		const isSelectedFilterEmpty = selectedFilterKeys.reduce((acc, curr) => {
			const filter = selectedFilters[curr];
			const keys = Object.keys(filter);
			return !keys.length && acc;
		}, true);

		const {
			toggleSelectAllAdUnits,
			handleBulkActionSelect,
			giveSelectedFilterDom,
			handleRemoveAllFilters,
			handleMasterSave,
			onAdSizeSettingsSave,
			modalToggle
		} = this;

		if (!isInventoryFetched) {
			return <Loader />;
		}

		const selecetdFilterKeys = Object.keys(selectedFilters);

		return (
			<div className="tools-inventory-tab">
				<AsyncGroupSelect
					key="filter list"
					filterList={filterList}
					selectedFilters={selectedFilters}
					onFilterValueChange={this.onFilterChange}
					getSelectedFilter={this.getSelectedFilter}
					showNotification={showNotification}
				/>
				<div className="inventory-actions">
					<div>
						<CustomButton
							variant="primary"
							className="u-margin-t3 u-margin-r3 pull-right"
							onClick={handleMasterSave}
						>
							Master Save
						</CustomButton>
						<div className="selected-filters">
							<div className={(isSelectedFilterEmpty && 'hide') || ''}>
								<div>Selected Filters</div>
								<div>
									<div>Remove all filters</div>
									<div onClick={handleRemoveAllFilters} className="cross">
										X
									</div>
								</div>
							</div>
							{selecetdFilterKeys.map(filter =>
								giveSelectedFilterDom(selectedFilters[filter], filter)
							)}
						</div>
					</div>
					<div className="inventory-actions-bulk">
						<Checkbox checked={isAllUnitSelected} onChange={toggleSelectAllAdUnits}>
							Select All
						</Checkbox>

						<CustomButton
							className="inventory-edit-configuraion"
							disabled={bulkActionName !== 'disable-downwardSizesDisabled'}
							type="button"
							onClick={this.openAdSettingsModal({ type: 'global', sizeFilters: globalAdUnitSize })}
						>
							Edit Configuration
						</CustomButton>
						<div className="inventory-actions-bulk-dropdown">
							<SelectBox
								id="inventory-actions-bulk-update"
								key="inventory-actions-bulk-update"
								isClearable={false}
								isSearchable={false}
								wrapperClassName="custom-select-box-wrapper"
								reset
								selected={bulkActionName}
								title="Bulk Actions"
								options={INVENTORY_BULK_ACTIONS}
								onSelect={handleBulkActionSelect}
							/>
						</div>
					</div>
				</div>
				<div style={{ marginTop: '20px' }}>
					<CustomReactTable
						columns={this.getTableHeaders(tableHeader)}
						data={this.getTableBody(filteredAds, tableHeader)}
						filterable={false}
						showPaginationTop
						showPaginationBottom={false}
						defaultPageSize={50}
						pageSizeOptions={[50, 100, 150, 200, 250]}
						minRows={0}
						defaultSorted={[
							{
								id: 'activeStatus',
								desc: false
							}
						]}
						sortable
					/>
					<Prompt when={hasUnsavedChanges} message={config.HB_MSGS.UNSAVED_CHANGES} />
					<Modal show={modalShow} onHide={this.modalToggle}>
						<Modal.Header>
							<Modal.Title>Ad Units Settings</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<AdUnitSettings
								onAdSizeSettingsSave={onAdSizeSettingsSave}
								filteredAds={filteredAds}
								modalData={modalData}
								modalToggle={modalToggle}
							/>
						</Modal.Body>
						<div style={{ clear: 'both' }}>&nbsp;</div>
					</Modal>
				</div>
			</div>
		);
	}
}
export default AdunitsInventory;
