import React from 'react';
import clonedeep from 'lodash/cloneDeep';
import { Modal } from '@/Client/helpers/react-bootstrap-imports';
import sortBy from 'lodash/sortBy';
import 'react-table/react-table.css';
import CustomReactTable from '../../../../../Components/CustomReactTable/index';
import CustomButton from '../../../../../Components/CustomButton/index';
import axiosInstance from '../../../../../helpers/axiosInstance';
import Loader from '../../../../../Components/Loader';
import AdUnitSettings from './AdUnitSettings';
import AsyncGroupSelect from '../../../../../Components/AsyncGroupSelect';

class AdunitsInventory extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			allAds: [],
			filteredAds: [],
			isLoading: true,
			show: false,
			selectedFilters: {},
			modalData: { header: null, body: null, footer: null }
		};
	}

	componentWillMount() {
		const filterList = [
			{ name: 'Domains', value: 'siteDomain', isDisabled: false, key: 'siteDomain' },
			{ name: 'Site Id', value: 'siteId', isDisabled: false, key: 'siteId' },
			{ name: 'Adunit Name', value: 'dfpAdunit', isDisabled: true, key: 'dfpAdunit' }
		];
		this.setState({ filterList });

		const tableHeader = [
			{
				Header: 'Site Id',
				accessor: 'siteId',
				width: 100,
				maxWidth: 100,
				minWidth: 100
			},
			{
				Header: 'Domain',
				accessor: 'siteDomain',
				width: 220,
				maxWidth: 250,
				minWidth: 250
			},
			{
				Header: 'Ad Unit Name',
				accessor: 'dfpAdunit',
				width: 500,
				maxWidth: 800,
				minWidth: 500
			},
			{
				Header: 'Settings',
				accessor: 'adUnitSettings',
				width: 200,
				maxWidth: 200,
				minWidth: 200
			}
		];

		this.setState({ tableHeader });
	}

	componentDidMount() {
		this.getAdunits();
	}

	modalToggle = (data = {}) => {
		const { show, modalData } = this.state;
		this.setState({
			show: !show,
			modalData: {
				...modalData,
				...data
			}
		});
	};

	getAdunits = () => {
		axiosInstance
			.get('/ops/getSiteMapping')
			.then(({ data: siteMappingData }) => {
				const siteDomainMapping = {};
				let { data: siteMapping } = siteMappingData;
				siteMapping.forEach(d => {
					siteDomainMapping[d.siteId] = d.siteDomain;
				});

				axiosInstance
					.get('/ops/getAdUnitMapping')
					.then(({ data }) => {
						let { data: adUnitData } = data;

						const allAdUnits = [];
						adUnitData.forEach(d => {
							d.value.siteDomain = d.value.siteDomain || siteDomainMapping[+d.value.siteId];
							allAdUnits.push({
								...d.value,
								adUnitSettings: true,
								docId: d.id
							});
						});

						this.setState({ allAds: allAdUnits, filteredAds: allAdUnits, isLoading: false });
					})
					.catch(error => {
						console.log(error);
					});
			})
			.catch(error => console.log(error));
	};

	onFilterChange = selectedFilters => {
		const { allAds, filterList } = this.state;

		let tempAllAds = [];
		let filteredAdList = [];

		const uniqueAdsFlag = [];

		if (
			Object.keys(selectedFilters).length &&
			(Object.keys(selectedFilters['siteDomain'] || {}).length ||
				Object.keys(selectedFilters['siteId'] || {}).length)
		) {
			filterList.forEach(d => {
				if (d.key === 'dfpAdunit') {
					d.isDisabled = false;
				}
			});

			this.setState({ filterList });
		} else {
			filterList.forEach((d, i) => {
				if (d.key === 'dfpAdunit') {
					d.isDisabled = true;
				}
			});

			this.setState({
				filterList,
				filteredAds: allAds,
				selectedFilters: { ...selectedFilters, dfpAdunit: {} }
			});
			return;
		}

		for (const filter in selectedFilters) {
			tempAllAds = allAds.filter(ad => {
				if (Object.keys(selectedFilters[filter]).includes(ad[filter] && ad[filter].toString())) {
					return ad;
				}
			});
			if (filter == 'dfpAdunit' && Object.keys(selectedFilters[filter]).length) {
				// Display only selected ad units
				filteredAdList = tempAllAds;
				this.setState(state => ({ ...state, filteredAds: filteredAdList }));
				return;
			} else {
				tempAllAds.forEach(ad => {
					if (!uniqueAdsFlag.includes(ad.dfpAdunit)) {
						uniqueAdsFlag.push(ad.dfpAdunit);
						filteredAdList.push(ad);
					}
				});
			}
		}

		this.setState(state => {
			return { ...state, filteredAds: filteredAdList };
		});
	};

	getSelectedFilter = filter => {
		return new Promise((resolve, reject) => {
			const { allAds, selectedFilters } = this.state;
			const response = { data: { result: [] }, status: 200 };

			const uniqueAds = [];
			const filterKey = filter.key;

			response.data.result = allAds
				.map(d => ({
					id: d[filterKey],
					value: d[filterKey] && d[filterKey].toString(),
					name: d[filterKey],
					isDisabled: false,
					tempSiteId: d.siteId,
					tempSiteDomain: d.siteDomain
				}))
				.filter(ad => {
					if (!ad.value) {
						return;
					}
					if (filter.key === 'dfpAdunit' && Object.keys(selectedFilters).length) {
						if (
							((selectedFilters.siteId && selectedFilters.siteId[ad.tempSiteId]) ||
								(selectedFilters.siteDomain && selectedFilters.siteDomain[ad.tempSiteDomain])) &&
							!uniqueAds.includes(ad.value)
						) {
							uniqueAds.push(ad.value);
							return ad;
						}
					} else {
						if (!uniqueAds.includes(ad.value)) {
							uniqueAds.push(ad.value);
							return ad;
						}
					}
				});
			return resolve(response);
		});
	};

	getTableHeaders = columns => {
		const sortedColumns = sortBy(clonedeep(columns), ['position']);

		return sortedColumns.map(column => {
			const { Header, accessor, width = 150, maxWidth = 300, minWidth = 150 } = column;
			const commonProps = { accessor, width, maxWidth, minWidth };

			return {
				Header,
				...commonProps
			};
		});
	};

	getTableBody = (data, columnsMeta) => {
		const columnsMetaObj = this.convertColumnsMetaArrToObj(columnsMeta);
		console.log(columnsMetaObj);

		return data.map(row => {
			const rowCopy = clonedeep(row);
			for (const columnKey in rowCopy) {
				if (columnKey == 'adUnitSettings') {
					rowCopy[columnKey] = (
						<span>
							<CustomButton
								variant="secondary"
								className="u-margin-t3 u-margin-r3"
								adid={rowCopy['adId']}
								siteid={rowCopy['siteId']}
								docid={rowCopy['docId']}
								onClick={this.openSettings}
							>
								Edit Ad Unit
							</CustomButton>
						</span>
					);
				}
			}
			return rowCopy;
		});
	};

	updateAdUnitData = adUnitData => {
		console.log({ adUnitData });
		const { filteredAds } = this.state;
		let updateAdIndex = -1;
		filteredAds.filter((d, i) => {
			if (d.adId === adUnitData.adId) {
				updateAdIndex = i;
				return d;
			}
		});
		filteredAds[updateAdIndex] = { ...filteredAds[updateAdIndex], ...adUnitData };
		console.log(filteredAds[updateAdIndex]);
		this.setState({ filteredAds });
	};

	openSettings = event => {
		const element = event.target;
		const adId = element.getAttribute('adid');
		const docId = element.getAttribute('docid');
		const siteId = element.getAttribute('siteid');

		const { filteredAds } = this.state;
		const adData = filteredAds.filter(d => {
			if (d.adId == adId) {
				return d;
			}
		});

		const { showNotification } = this.props;
		this.modalToggle({
			header: 'Adunit Settings',
			body: (
				<AdUnitSettings
					showNotification={showNotification}
					adid={adId}
					docid={docId}
					siteid={siteId}
					adUnitData={adData[0]}
					modalToggle={this.modalToggle}
					updateAdUnitData={this.updateAdUnitData}
				/>
			),
			footer: false
		});
	};

	convertColumnsMetaArrToObj = columnsMetaArr =>
		columnsMetaArr.reduce((obj, column) => {
			const { key, ...value } = column;
			obj[key] = value;
			return obj;
		}, {});

	render() {
		const {
			filterList,
			tableHeader,
			isLoading,
			show,
			filteredAds,
			modalData,
			selectedFilters
		} = this.state;
		const { showNotification } = this.props;

		if (isLoading) {
			return <Loader />;
		}

		return (
			<>
				<AsyncGroupSelect
					key="filter list"
					filterList={filterList}
					selectedFilters={selectedFilters}
					onFilterValueChange={this.onFilterChange}
					getSelectedFilter={this.getSelectedFilter}
					showNotification={showNotification}
				/>

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
				</div>

				<Modal show={show} onHide={this.modalToggle}>
					<Modal.Header>
						<Modal.Title>{modalData.header}</Modal.Title>
					</Modal.Header>
					<Modal.Body>{modalData.body}</Modal.Body>
					{modalData.footer ? <Modal.Body>{modalData.footer}</Modal.Body> : null}
					<div style={{ clear: 'both' }}>&nbsp;</div>
				</Modal>
			</>
		);
	}
}
export default AdunitsInventory;