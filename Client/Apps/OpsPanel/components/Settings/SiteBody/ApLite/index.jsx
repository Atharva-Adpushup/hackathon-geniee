/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component, Fragment } from 'react';
import Papa from 'papaparse';
import uuid from 'uuid';
import isEqual from 'lodash/isEqual';
import differenceWith from 'lodash/differenceWith';
import { CSVLink } from 'react-csv';
import { Panel, PanelGroup, Modal, Checkbox } from '@/Client/helpers/react-bootstrap-imports';

import CustomReactTable from '../../../../../../Components/CustomReactTable/index';
import axiosInstance from '../../../../../../helpers/axiosInstance';
import CustomButton from '../../../../../../Components/CustomButton/index';
import FieldGroup from '../../../../../../Components/Layout/FieldGroup';
import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import SelectBox from '../../../../../../Components/SelectBox/index';
import {
	REFRESH_RATE_ENTRIES,
	AP_LIGHT_AD_UNIT_OPERATIONS
} from '../../../../configs/commonConsts';

const dfpAdsUnitNamesToFilter = ['DEFAULT', 'TOTAL', '', 'AD UNIT CODE', 'AD UNIT'];

const DEFAULT_STATE = {
	file: null,
	fileName: '',
	structuredAdUnits: []
};

class ApLite extends Component {
	state = {
		view: 'list',
		isLoading: false,
		isError: false,
		adRefresh: true,
		headerBidding: true,
		show: false,
		selectedRefreshRate: REFRESH_RATE_ENTRIES[0].value,
		structuredAdUnits: [],
		oldAdUnits: [],
		uploadedAdUnits: [],
		selectedAdUnitCodeForHB: [],
		selectedAdUnitCodeForVideoFormat: [],
		selectAllFormats: true,
		selectedAdUnitOperation: AP_LIGHT_AD_UNIT_OPERATIONS[0].value,
		selectedAdUnitCodeActive: [],
		...DEFAULT_STATE
	};

	componentDidMount() {
		const {
			fetchHBInitDataAction,
			site: { siteId }
		} = this.props;
		fetchHBInitDataAction(siteId);
	}

	static getDerivedStateFromProps(props, currentState) {
		const { site: { apps: { pnp = false } = {} } = {} } = props;
		if (pnp) {
			return {
				...currentState,
				adRefresh: false,
				isRefreshButtonDisabled: true
			};
		} else return { ...currentState, isRefreshButtonDisabled: false };
	}

	componentDidUpdate(prevProps) {
		const { site: { apps: { pnp: previousPnpToggle = false } = {} } = {} } = prevProps;
		const { site: { apps: { pnp: currentPnpToggle = false } = {}, siteId } = {} } = this.props;
		if (previousPnpToggle !== currentPnpToggle) {
			return axiosInstance
				.get(`ops/ap-lite/${siteId}`)
				.then(res => {
					const {
						data: { adUnits }
					} = res.data;
					this.setSatesFromAdUnits(adUnits);
				})
				.catch(err => this.setState({ isError: true }));
		}
	}

	handleReset = () => this.setState(DEFAULT_STATE);

	handleSelect = value => {
		const {
			site: { siteId }
		} = this.props;
		this.setState({
			activeKey: value
		});

		return axiosInstance
			.get(`ops/ap-lite/${siteId}`)
			.then(res => {
				const {
					data: { adUnits }
				} = res.data;
				this.setSatesFromAdUnits(adUnits);
			})
			.catch(err => this.setState({ isError: true }));
	};

	setSatesFromAdUnits = adUnits => {
		const headerBiddingEnabledAdUnits = [];
		const adRefreshEnabledUnits = [];
		const videoFormatEnabledUnits = [];
		const activeAdUnits = [];

		adUnits.forEach(({ headerBidding, dfpAdunitCode, formats, refreshSlot, isActive }) => {
			if (headerBidding) {
				headerBiddingEnabledAdUnits.push(dfpAdunitCode);
			}
			if (refreshSlot) {
				adRefreshEnabledUnits.push(dfpAdunitCode);
			}
			if (formats.includes('video')) {
				videoFormatEnabledUnits.push(dfpAdunitCode);
			}
			if (isActive) {
				activeAdUnits.push(dfpAdunitCode);
			}
		});

		const { refreshInterval } = adUnits[0];
		this.setState({
			selectedRefreshRate: refreshInterval,
			oldAdUnits: adUnits,
			selectedAdUnitCodeForHB: headerBiddingEnabledAdUnits,
			selectedAdUnitCodeForAdRefresh: adRefreshEnabledUnits,
			selectedAdUnitCodeForVideoFormat: videoFormatEnabledUnits,
			selectedAdUnitCodeActive: activeAdUnits,
			headerBidding: headerBiddingEnabledAdUnits.length === adUnits.length,
			adRefresh: adRefreshEnabledUnits.length === adUnits.length,
			selectAllFormats: videoFormatEnabledUnits.length === adUnits.length
		});
	};

	stateToReturn = (prop, value, defaultState, adUnits) => {
		if (prop === 'headerBidding') {
			defaultState.headerBidding = !!value;
			defaultState.selectedAdUnitCodeForHB = value
				? adUnits.map(({ dfpAdunitCode }) => dfpAdunitCode)
				: [];
		}
		if (prop === 'adRefresh') {
			defaultState.refreshSlot = !!value;
			defaultState.selectedAdUnitCodeForAdRefresh = value
				? adUnits.map(({ dfpAdunitCode }) => dfpAdunitCode)
				: [];
		}

		if (prop === 'selectAllFormats') {
			defaultState.selectAllFormats = !!value;
			defaultState.selectedAdUnitCodeForVideoFormat = value
				? adUnits.map(({ dfpAdunitCode }) => dfpAdunitCode)
				: [];
		}

		return defaultState;
	};

	handleToggle = (value, event) => {
		const { oldAdUnits, uploadedAdUnits, structuredAdUnits } = this.state;
		const attributeValue = event.target.getAttribute('name');
		const name = attributeValue.split('-')[0];
		const adUnits = structuredAdUnits.length
			? structuredAdUnits
			: uploadedAdUnits.length
			? uploadedAdUnits
			: oldAdUnits;

		const defaultState = {
			[name]: value
		};

		adUnits.map(adUnit => {
			if (name === 'headerBidding') {
				adUnit.headerBidding = !!value;
			}
			if (name === 'adRefresh') {
				adUnit.refreshSlot = !!value;
			}
			if (name === 'selectAllFormats') {
				adUnit.formats = value ? ['display', 'video'] : ['display'];
			}
		});

		const stateToReturn = this.stateToReturn(name, value, defaultState, adUnits);

		this.setState(() => {
			if (name === 'headerBidding' || name === 'adRefresh' || name === 'selectAllFormats') {
				if (structuredAdUnits.length) {
					return {
						structuredAdUnits: adUnits,
						...stateToReturn
					};
				}
				if (!structuredAdUnits.length && uploadedAdUnits.length) {
					return {
						uploadedAdUnits: adUnits,
						...stateToReturn
					};
				}
				return {
					oldAdUnits: adUnits,
					...stateToReturn
				};
			}
			return {
				stateToReturn
			};
		});
	};

	handleHide = () => {
		this.setState({ show: false });
	};

	onSelect = (value, key) => {
		this.setState({ [key]: value });
	};

	handleGAM = e => {
		const { showNotification } = this.props;

		if (!e.target.value.endsWith('.csv')) {
			this.setState({ fileName: '' });
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Only csv files are allowed',
				autoDismiss: 5
			});
		}

		this.setState(
			{
				fileName: e.target.value,
				file: e.target.files[0],
				headerBidding: true,
				adRefresh: true,
				selectAllFormats: true
			},
			this.handleFileSelect
		);
	};

	handleFileSelect = () => {
		const { showNotification } = this.props;
		const { headerBidding, adRefresh } = this.state;

		const adUnitsArr = [];
		const adUnitMap = {};
		let parentAdUnitError = false;

		Papa.parse(this.state.file, {
			delimiter: '',
			chunkSize: 3,
			header: false,
			complete: responses => {
				responses.data.forEach(unit => {
					if (
						!dfpAdsUnitNamesToFilter.includes(unit[0].toUpperCase().trim()) &&
						unit[0] !== undefined
					)
						adUnitMap[unit[0].trim()] = unit[1].trim();
				});

				for (const key in adUnitMap) {
					let parentAdUnit;
					let dfpAdUnit = adUnitMap[key];
					const dfpAdunitCode = adUnitMap[key];

					if (key.includes('»')) {
						parentAdUnit = key.split('»')[0].trim();

						if (parentAdUnit && !adUnitMap[parentAdUnit]) {
							this.handleReset();
							parentAdUnitError = true;

							showNotification({
								mode: 'error',
								title: 'Operation Failed',
								message: `Parent Ad Unit "${parentAdUnit}" not found in adUnits column, Kindly add the Parent Ad Unit Name first in the list and try to upload again`,
								autoDismiss: 5
							});

							break;
						} else {
							dfpAdUnit = `${adUnitMap[parentAdUnit]}/${dfpAdUnit}`;
						}
					}

					adUnitsArr.push({
						dfpAdUnit,
						dfpAdunitCode,
						headerBidding,
						isActive: true,
						refreshSlot: adRefresh,
						formats: ['display', 'video']
					});
				}
				if (!parentAdUnitError)
					this.setState({
						structuredAdUnits: adUnitsArr,
						selectedAdUnitCodeForHB: [...adUnitsArr.map(({ dfpAdunitCode }) => dfpAdunitCode)],
						selectedAdUnitCodeForAdRefresh: [
							...adUnitsArr.map(({ dfpAdunitCode }) => dfpAdunitCode)
						],
						selectedAdUnitCodeForVideoFormat: [
							...adUnitsArr.map(({ dfpAdunitCode }) => dfpAdunitCode)
						],
						selectedAdUnitCodeActive: [...adUnitsArr.map(({ dfpAdunitCode }) => dfpAdunitCode)]
					});
			}
		});
	};

	showUploadedAdUnits = () => {
		this.setState({ show: true });
	};

	handleSave = () => {
		const {
			structuredAdUnits,
			oldAdUnits,
			uploadedAdUnits,
			fileName,
			adRefresh,
			headerBidding,
			selectedRefreshRate,
			selectedAdUnitOperation,
			selectedAdUnitCodeActive
		} = this.state;
		const {
			site: { siteId },
			showNotification,
			dataForAuditLogs
		} = this.props;
		let adUnits = [];
		const oldAdUnitsWithDfpNameAndCode = oldAdUnits.map(({ refreshInterval, ...rest }) => rest);

		if (!uploadedAdUnits && !oldAdUnits.length && !fileName) {
			showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Please select a valid Ad Unit csv file first',
				autoDismiss: 5
			});
		}

		if (!fileName && (uploadedAdUnits.length || oldAdUnits.length)) {
			adUnits = uploadedAdUnits.length
				? uploadedAdUnits.map(v => ({
						...v,
						isActive: selectedAdUnitCodeActive.includes(v.dfpAdunitCode)
				  }))
				: oldAdUnitsWithDfpNameAndCode.map(v => ({
						...v,
						isActive: selectedAdUnitCodeActive.includes(v.dfpAdunitCode)
				  }));
		} else if (fileName && !oldAdUnits.length && !uploadedAdUnits.length) {
			adUnits = structuredAdUnits.map(v => ({ ...v, sectionId: uuid.v4(), isActive: true }));
		} else {
			const unCommonAdUnits = differenceWith(
				uploadedAdUnits.length ? uploadedAdUnits : oldAdUnitsWithDfpNameAndCode,
				structuredAdUnits,
				isEqual
			);

			if (selectedAdUnitOperation === AP_LIGHT_AD_UNIT_OPERATIONS[1].value) {
				adUnits = [
					...structuredAdUnits.map(v => ({
						...v,
						sectionId: uuid.v4(),
						isActive: selectedAdUnitCodeActive.includes(v.dfpAdunitCode)
					}))
				];
			} else if (selectedAdUnitOperation === AP_LIGHT_AD_UNIT_OPERATIONS[0].value) {
				adUnits = [
					...unCommonAdUnits,
					...structuredAdUnits.map(v => ({
						...v,
						sectionId: uuid.v4(),
						isActive: selectedAdUnitCodeActive.includes(v.dfpAdunitCode)
					}))
				];
			}
		}

		adUnits = adUnits.map(v =>
			Object.assign(
				{},
				{
					...v,
					refreshInterval: selectedRefreshRate
				}
			)
		);
		this.setState({ isLoading: true });

		return axiosInstance
			.put(`/ops/ap-lite/${siteId}`, {
				adUnits,
				dataForAuditLogs: {
					...dataForAuditLogs,
					actionInfo: `Updated AP Lite`
				}
			})
			.then(res => {
				const {
					data: { adUnits }
				} = res.data;

				showNotification({
					mode: 'success',
					title: 'Success',
					message: 'Settings saved successsfully',
					autoDismiss: 5
				});

				this.setSatesFromAdUnits(adUnits);
				this.handleReset();
			})
			.catch(err => {
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: 'Something went wrong',
					autoDismiss: 5
				});
				console.log(err);
			});
	};

	getHbStatus(setupStatus) {
		const { dfpConnected, biddersFound, adServerSetupStatus, isPublisherActiveDfp } = setupStatus;
		if (dfpConnected && biddersFound && adServerSetupStatus === 2 && isPublisherActiveDfp) {
			return 'Complete';
		}
		if (dfpConnected && !biddersFound && adServerSetupStatus === 2 && isPublisherActiveDfp) {
			return 'HB Setup Complete(No Bidders Active)';
		}
		return 'Pending';
	}

	getNetworkName(adNetworkSettings, activeDFPNetworkId) {
		const dfPNetworkNameField = adNetworkSettings.find(val => val.networkName === 'DFP') || {};
		const { dfpAccounts = [] } = dfPNetworkNameField;
		const matchDfpAccount =
			dfpAccounts.find(val => val.code === activeDFPNetworkId.toString()) || {};

		return matchDfpAccount.name || '';
	}

	gamAdUnitsLabel = () => (
		<React.Fragment>
			GAM Ad Units{' '}
			<CSVLink
				headers={[
					{ label: 'Ad unit', key: 'dfpAdUnit' },
					{ label: 'Ad Unit Code', key: 'dfpAdUnitCode' }
				]}
				data={[]}
				filename="adUnitsTemplate.csv"
				style={{ display: 'block' }}
			>
				<small> (Download CSV Template)</small>
			</CSVLink>
		</React.Fragment>
	);

	handleHBChange = (e, adunitCode) => {
		const { uploadedAdUnits, oldAdUnits, structuredAdUnits, selectedAdUnitCodeForHB } = this.state;

		const adUnits = structuredAdUnits.length
			? structuredAdUnits
			: uploadedAdUnits.length
			? uploadedAdUnits
			: oldAdUnits;
		if (e.target.checked) {
			selectedAdUnitCodeForHB.push(adunitCode);
			adUnits.find(v => v.dfpAdunitCode === adunitCode).headerBidding = true;
		} else {
			selectedAdUnitCodeForHB.splice(selectedAdUnitCodeForHB.indexOf(adunitCode), 1);
			adUnits.find(v => v.dfpAdunitCode === adunitCode).headerBidding = false;
		}
		this.setState({
			selectedAdUnitCodeForHB,
			oldAdUnits,
			uploadedAdUnits,
			structuredAdUnits,
			headerBidding: selectedAdUnitCodeForHB.length === adUnits.length
		});
	};

	handleActiveChange = (e, adunitCode) => {
		const { selectedAdUnitCodeActive, selectedAdUnitCodeForHB } = this.state;
		if (e.target.checked) {
			selectedAdUnitCodeActive.push(adunitCode);
		} else {
			selectedAdUnitCodeActive.splice(selectedAdUnitCodeActive.indexOf(adunitCode), 1);
		}
		this.setState({
			selectedAdUnitCodeActive
		});
	};

	handleAdRefreshChange = (e, adunitCode) => {
		const {
			uploadedAdUnits,
			oldAdUnits,
			structuredAdUnits,
			selectedAdUnitCodeForAdRefresh
		} = this.state;
		const adUnits = structuredAdUnits.length
			? structuredAdUnits
			: uploadedAdUnits.length
			? uploadedAdUnits
			: oldAdUnits;
		if (e.target.checked) {
			selectedAdUnitCodeForAdRefresh.push(adunitCode);
			adUnits.find(v => v.dfpAdunitCode === adunitCode).refreshSlot = true;
		} else {
			selectedAdUnitCodeForAdRefresh.splice(selectedAdUnitCodeForAdRefresh.indexOf(adunitCode), 1);
			adUnits.find(v => v.dfpAdunitCode === adunitCode).refreshSlot = false;
		}

		this.setState({
			selectedAdUnitCodeForAdRefresh,
			oldAdUnits,
			uploadedAdUnits,
			structuredAdUnits,
			adRefresh: selectedAdUnitCodeForAdRefresh.length === adUnits.length
		});
	};

	handleVideoChange = (e, adunitCode) => {
		const {
			uploadedAdUnits,
			oldAdUnits,
			structuredAdUnits,
			selectedAdUnitCodeForVideoFormat
		} = this.state;

		const adUnits = structuredAdUnits.length
			? structuredAdUnits
			: uploadedAdUnits.length
			? uploadedAdUnits
			: oldAdUnits;
		if (e.target.checked) {
			selectedAdUnitCodeForVideoFormat.push(adunitCode);
			const adunit = adUnits.find(v => v.dfpAdunitCode === adunitCode);
			if (!adunit.formats.includes('video')) {
				adunit.formats.push('video');
			}
		} else {
			selectedAdUnitCodeForVideoFormat.splice(
				selectedAdUnitCodeForVideoFormat.indexOf(adunitCode),
				1
			);
			const adunit = adUnits.find(v => v.dfpAdunitCode === adunitCode);
			if (adunit.formats.includes('video')) {
				adunit.formats.splice(adunit.formats.indexOf('video'), 1);
			}
		}

		this.setState({
			selectedAdUnitCodeForVideoFormat,
			oldAdUnits,
			uploadedAdUnits,
			structuredAdUnits,
			selectAllFormats: selectedAdUnitCodeForVideoFormat.length === adUnits.length
		});
	};

	renderModal = () => {
		let showAdUnits;
		const {
			structuredAdUnits,
			show,
			oldAdUnits,
			uploadedAdUnits,
			selectedAdUnitCodeForHB,
			selectedAdUnitCodeForAdRefresh,
			selectedAdUnitCodeForVideoFormat,
			selectedAdUnitCodeActive,
			isRefreshButtonDisabled
		} = this.state;

		if (structuredAdUnits.length) {
			showAdUnits = structuredAdUnits;
		} else if (!structuredAdUnits.length && uploadedAdUnits.length) {
			showAdUnits = uploadedAdUnits;
		} else {
			showAdUnits = oldAdUnits;
		}

		return (
			<Modal
				show={show}
				onHide={this.handleHide}
				container={this}
				aria-labelledby="contained-modal-title"
				className="adUnit-modal"
			>
				<Modal.Header closeButton>
					<Modal.Title id="contained-modal-title">List of Ad Units</Modal.Title>
				</Modal.Header>
				<Modal.Body className="aplite-modal">
					<CustomReactTable
						columns={[
							{ Header: 'Ad Unit', accessor: 'dfpAdUnit' },
							{ Header: 'Ad Unit Code', accessor: 'dfpAdunitCode' },
							{
								Header: 'Header Bidding',
								Cell: ({ original: { dfpAdunitCode } }) => (
									<Checkbox
										onChange={e => this.handleHBChange(e, dfpAdunitCode)}
										checked={selectedAdUnitCodeForHB.includes(dfpAdunitCode)}
									/>
								),
								width: 100
							},
							{
								Header: 'Ad Refresh',
								Cell: ({ original: { dfpAdunitCode } }) => (
									<Checkbox
										onChange={e => this.handleAdRefreshChange(e, dfpAdunitCode)}
										checked={selectedAdUnitCodeForAdRefresh.includes(dfpAdunitCode)}
										disabled={isRefreshButtonDisabled}
									/>
								),
								width: 100
							},
							{
								Header: 'Enable Outstream Video',
								Cell: ({ original: { dfpAdunitCode } }) => (
									<Checkbox
										onChange={e => this.handleVideoChange(e, dfpAdunitCode)}
										checked={selectedAdUnitCodeForVideoFormat.includes(dfpAdunitCode)}
									>
										video
									</Checkbox>
								)
							},
							{
								Header: 'Active',
								Cell: ({ original: { dfpAdunitCode } }) => (
									<Checkbox
										onChange={e => this.handleActiveChange(e, dfpAdunitCode)}
										checked={selectedAdUnitCodeActive.includes(dfpAdunitCode)}
									/>
								)
							}
						]}
						data={showAdUnits}
						defaultPageSize={20}
						minRows={0}
					/>
				</Modal.Body>
				<Modal.Footer>
					<CustomButton onClick={this.handleHide}>Close</CustomButton>
				</Modal.Footer>
			</Modal>
		);
	};

	renderView = () => {
		const styles = {
			display: 'inline-block',
			float: 'right',
			fontWeight: 'bold',
			padding: '5px 15px'
		};
		const {
			site,
			userData: { adServerSettings = {}, adNetworkSettings = [] },
			headerBiddingData
		} = this.props;
		const { dfp = {} } = adServerSettings;
		const { activeDFPNetwork } = dfp;

		const { siteId, siteDomain } = site;
		const {
			selectedRefreshRate,
			adRefresh,
			fileName,
			oldAdUnits,
			uploadedAdUnits,
			headerBidding,
			selectAllFormats,
			selectedAdUnitOperation,
			isRefreshButtonDisabled = false
		} = this.state;

		const { setupStatus } = headerBiddingData[siteId];
		const hbStatus = this.getHbStatus(setupStatus);

		const activeDFPNetworkId =
			adServerSettings.hasOwnProperty('dfp') && dfp.hasOwnProperty('activeDFPNetwork')
				? activeDFPNetwork
				: null;

		const activeDFPNetworkName = activeDFPNetworkId
			? adNetworkSettings.length && adNetworkSettings.find(val => val.networkName === 'DFP')
				? this.getNetworkName(adNetworkSettings, activeDFPNetworkId)
				: ''
			: null;

		return (
			<div>
				<FieldGroup
					name="Google Ad Manager"
					value={
						activeDFPNetworkId
							? activeDFPNetworkName
								? `Connected (${activeDFPNetworkName}, ${activeDFPNetworkId})`
								: `Connected (${activeDFPNetworkId})`
							: 'Not Connected'
					}
					isTextOnly
					textOnlyStyles={styles}
					label="Google Ad Manager"
					size={6}
					id="googleAdManager-text"
					className="u-padding-v4 u-padding-h4"
				/>
				<FieldGroup
					name="HB App"
					value={hbStatus}
					isTextOnly
					textOnlyStyles={styles}
					label="HB App"
					size={6}
					id="hbApp-text"
					className="u-padding-v4 u-padding-h4"
				/>

				<FieldGroup
					name="GAM Ad Units"
					className="u-padding-v4 u-padding-h4"
					value={fileName}
					onChange={this.handleGAM}
					onClick={event => {
						event.target.value = null;
					}}
					type="toggle-file-select-group"
					label={this.gamAdUnitsLabel()}
					id="gamAdUnits-text"
					itemCollection={AP_LIGHT_AD_UNIT_OPERATIONS}
					dataKey="selectedAdUnitOperation"
					fileDropdownValue={selectedAdUnitOperation}
					onFileDropdownChange={this.onSelect}
					fileDropdownTitle="Select Operation"
					reset
				/>

				{fileName || uploadedAdUnits.length || oldAdUnits.length ? (
					<React.Fragment>
						<CustomToggleSwitch
							labelText="Toggle HB"
							className="u-margin-b4 negative-toggle"
							checked={headerBidding}
							onChange={this.handleToggle}
							layout="horizontal"
							size="m"
							on="Yes"
							off="No"
							defaultLayout
							name={`headerBidding-${siteId}-${siteDomain}`}
							id={`js-headerBidding-${siteId}-${siteDomain}`}
						/>

						<CustomToggleSwitch
							labelText="Toggle outstream video"
							className="u-margin-b4 negative-toggle"
							checked={selectAllFormats}
							onChange={this.handleToggle}
							layout="horizontal"
							size="m"
							on="Yes"
							off="No"
							defaultLayout
							name={`selectAllFormats-${siteId}-${siteDomain}`}
							id={`js-selectAllFormats-${siteId}-${siteDomain}`}
						/>

						<CustomToggleSwitch
							labelText="Ad Refresh"
							className="u-margin-b4 negative-toggle"
							checked={adRefresh}
							onChange={this.handleToggle}
							layout="horizontal"
							size="m"
							on="Yes"
							off="No"
							defaultLayout
							name={`adRefresh-${siteId}-${siteDomain}`}
							id={`js-adRefresh-${siteId}-${siteDomain}`}
							disabled={isRefreshButtonDisabled}
						/>

						{adRefresh ? (
							<div className="refresh-rate" style={{ display: 'flex' }}>
								<p className="u-text-bold u-margin-b4">Refresh Rate</p>
								<SelectBox
									selected={selectedRefreshRate}
									options={REFRESH_RATE_ENTRIES}
									onSelect={this.onSelect}
									id="select-entry"
									title="Select Entry"
									dataKey="selectedRefreshRate"
									reset
									style={{ marginLeft: 'auto', width: '20%' }}
									className="refresh-rate"
								/>
							</div>
						) : null}

						<CustomButton variant="primary" bsSize="large" onClick={this.showUploadedAdUnits}>
							Show Uploaded Ad Units
						</CustomButton>
						{this.renderModal()}
					</React.Fragment>
				) : null}

				<CustomButton
					variant="secondary"
					className="pull-right u-margin-r3 u-margin-t4"
					onClick={this.handleReset}
				>
					Cancel
				</CustomButton>
				<CustomButton
					type="submit"
					variant="primary"
					className="pull-right u-margin-r3 u-margin-t4"
					onClick={this.handleSave}
				>
					Save
				</CustomButton>
			</div>
		);
	};

	render() {
		const { site } = this.props;
		const { siteId, siteDomain, apps = {} } = site;
		const { activeKey } = this.state;
		if (apps.apLite) {
			return (
				<div className="u-margin-t4">
					<PanelGroup
						accordion
						id={`apLite-panel-${siteId}-${siteDomain}`}
						activeKey={activeKey}
						onSelect={this.handleSelect}
					>
						<Panel eventKey="apLite">
							<Panel.Heading>
								<Panel.Title toggle>AP Lite</Panel.Title>
							</Panel.Heading>
							{activeKey === 'apLite' ? (
								<Panel.Body collapsible>{this.renderView()}</Panel.Body>
							) : null}
						</Panel>
					</PanelGroup>
				</div>
			);
		}
		return null;
	}
}

export default ApLite;
