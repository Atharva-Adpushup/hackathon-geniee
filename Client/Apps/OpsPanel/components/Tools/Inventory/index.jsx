/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-alert */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import clonedeep from 'lodash/cloneDeep';
import { Prompt } from 'react-router-dom';
import { Checkbox, Badge } from '@/Client/helpers/react-bootstrap-imports';
import sortBy from 'lodash/sortBy';
import 'react-table/react-table.css';
import CustomReactTable from '../../../../../Components/CustomReactTable/index';
import CustomButton from '../../../../../Components/CustomButton/index';
import Loader from '../../../../../Components/Loader';
import AsyncGroupSelect from '../../../../../Components/AsyncGroupSelect';
import config from '../../../../../config/config';
import SelectBox from '../../../../../Components/SelectBox';
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
			show: false,
			selectedFilters: {},
			adUnitLevelAction: {},
			isAllUnitSelected: false,
			selectedAdUnits: {},
			bulkActionName: null,
			filterList: config.ADMIN_INVENTORY_LIST_FILTER_LIST,
			tableHeader: config.ADMIN_INVENTORY_LIST_TABLE_HEADER,
			hasUnsavedChanges: false,
			isDefaultStateSet: false
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
					maxWidth: 400,
					minWidth: 350,
					width: 350
				};
			}
			return {
				Header,
				...commonProps
			};
		});
	};

	toggleAdUnitSelect = adId => () => {
		const { selectedAdUnits, adUnitLevelAction, bulkActionName } = this.state;
		selectedAdUnits[adId] = !selectedAdUnits[adId];
		adUnitLevelAction[adId] = bulkActionName;
		if (!selectedAdUnits[adId]) {
			adUnitLevelAction[adId] = null;
		}
		this.setState({
			selectedAdUnits,
			hasUnsavedChanges: true,
			bulkActionName,
			adUnitLevelAction
		});
	};

	handleSiteActionSelect = adId => value => {
		const { selectedAdUnits, adUnitLevelAction, bulkActionName } = this.state;
		let isAllUnitSelected = false;
		if (adUnitLevelAction[adId] === value) return;
		selectedAdUnits[adId] = value === bulkActionName;
		const selectedAdsIds = Object.keys(selectedAdUnits);
		const selectedAdsLength = selectedAdsIds.reduce((count, id) => {
			if (selectedAdUnits[id]) return count + 1;
			return count;
		}, 0);
		if (selectedAdsIds.length === selectedAdsLength) {
			isAllUnitSelected = true;
		}
		this.setState({
			adUnitLevelAction: {
				...adUnitLevelAction,
				[adId]: value
			},
			hasUnsavedChanges: true,
			selectedAdUnits,
			isAllUnitSelected
		});
	};

	getTableBody = data =>
		data.map(row => {
			const { selectedAdUnits, adUnitLevelAction } = this.state;
			const { toggleAdUnitSelect, handleSiteActionSelect } = this;
			const rowCopy = clonedeep(row);
			const { adId } = row;
			const columnKeys = Object.keys(rowCopy);
			for (let index = 0; index < columnKeys.length; index += 1) {
				const columnKey = columnKeys[index];
				if (columnKey === 'adUnitSettings') {
					rowCopy[columnKey] = (
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
							onSelect={handleSiteActionSelect(adId)}
						/>
					);
				} else if (columnKey === 'siteId') {
					rowCopy[columnKey] = (
						<Checkbox checked={!!selectedAdUnits[adId]} onChange={toggleAdUnitSelect(adId)}>
							{rowCopy[columnKey]}
						</Checkbox>
					);
				} else {
					rowCopy[columnKey] = <div className="mt-10">{rowCopy[columnKey]}</div>;
				}
			}
			return rowCopy;
		});

	toggleSelectAllAdUnits = () => {
		const { isAllUnitSelected, adUnitLevelAction, bulkActionName, filteredAds } = this.state;
		let selectedAdUnits = [];
		if (!isAllUnitSelected) {
			selectedAdUnits = filteredAds.reduce((acc, curr) => {
				const { adId } = curr;
				acc[adId] = true;
				adUnitLevelAction[adId] = bulkActionName;
				return acc;
			}, {});
		} else {
			filteredAds.forEach(ad => {
				const { adId } = ad;
				adUnitLevelAction[adId] = null;
			});
		}
		this.setState({
			selectedAdUnits,
			isAllUnitSelected: !isAllUnitSelected,
			hasUnsavedChanges: true,
			adUnitLevelAction
		});
	};

	handleBulkActionSelect = value => {
		const { selectedAdUnits, adUnitLevelAction } = this.state;
		const selectedAdsIds = Object.keys(selectedAdUnits);
		for (let index = 0; index < selectedAdsIds.length; index += 1) {
			const key = selectedAdsIds[index];
			if (selectedAdUnits[key]) adUnitLevelAction[key] = value;
		}
		this.setState({ bulkActionName: value, adUnitLevelAction, hasUnsavedChanges: true });
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
			filteredAds: allAds,
			isAllUnitSelected: false,
			bulkActionName: null
		});
	};

	seggragateAdsByDoc = updatedAds => {
		const { allAds } = this.props;
		const allAdsMap = allAds.reduce((adsMap, currentAd) => {
			const { adId } = currentAd;
			adsMap[adId] = currentAd;
			return adsMap;
		}, {});
		const adsByDocId = updatedAds.reduce((accAds, adUpdateData) => {
			const { adId } = adUpdateData;
			const adData = allAdsMap[adId];
			const { docId } = adData;
			if (!accAds[docId]) {
				accAds[docId] = [];
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
		const { allAds } = this.props;
		const allAdsMap = allAds.reduce((adsMap, currentAd) => {
			const { adId } = currentAd;
			adsMap[adId] = currentAd;
			return adsMap;
		}, {});
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

	// collapseUnfilled
	handleMasterSave = () => {
		const confirmationMessage = window.confirm('Are you sure you want to save the changes?');
		if (!confirmationMessage) {
			return;
		}
		let { dataForAuditLogs } = this.props;
		const { adUnitLevelAction } = this.state;
		const { seggragateAdsByDoc, getUpdatedAds, getAuditLogsData } = this;
		const allAdsIds = Object.keys(adUnitLevelAction);
		const updatedAds = getUpdatedAds(allAdsIds);

		const seggragatedAds = seggragateAdsByDoc(updatedAds);
		const { newAdConfig, oldAdConfig } = getAuditLogsData(updatedAds);
		const oldConfigSeggragated = seggragateAdsByDoc(oldAdConfig);
		const newConfigSeggragated = seggragateAdsByDoc(newAdConfig);
		const { updateInventoryTabAdUnits } = this.props;

		dataForAuditLogs = {
			...dataForAuditLogs,
			actionInfo: 'Inventory Tab Ad Unit Update',
			oldConfig: oldConfigSeggragated,
			newConfig: newConfigSeggragated
		};
		updateInventoryTabAdUnits({ seggragatedAds, adUnitLevelAction, dataForAuditLogs });
	};

	render() {
		const {
			filterList,
			tableHeader,
			filteredAds,
			bulkActionName,
			isAllUnitSelected,
			hasUnsavedChanges,
			selectedFilters
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
			handleMasterSave
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
				</div>
			</div>
		);
	}
}
export default AdunitsInventory;
