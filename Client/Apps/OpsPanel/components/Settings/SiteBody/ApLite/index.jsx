/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component, Fragment } from 'react';
import Papa from 'papaparse';
import uuid from 'uuid';
import isEqual from 'lodash/isEqual';
import differenceWith from 'lodash/differenceWith';
import { CSVLink } from 'react-csv';

import CustomReactTable from '../../../../../../Components/CustomReactTable/index.jsx';
import axiosInstance from '../../../../../../helpers/axiosInstance';
import { Panel, PanelGroup, Modal } from '@/Client/helpers/react-bootstrap-imports';
import CustomButton from '../../../../../../Components/CustomButton/index';
import FieldGroup from '../../../../../../Components/Layout/FieldGroup.jsx';
import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import SelectBox from '../../../../../../Components/SelectBox/index';
import { REFRESH_RATE_ENTRIES } from '../../../../configs/commonConsts';

const dfpAdsUnitNamesToFilter = ['DEFAULT', 'TOTAL', '', 'AD UNIT CODE', 'AD UNIT'];

const DEFAULT_STATE = {
	file: null,
	fileName: ''
};

class ApLite extends Component {
	state = {
		view: 'list',
		isLoading: false,
		isError: false,
		adRefresh: true,
		show: false,
		selectedRefreshRate: REFRESH_RATE_ENTRIES[0].value,
		structuredAdUnits: [],
		oldAdUnits: [],
		uploadedAdUnits: [],
		...DEFAULT_STATE
	};

	componentDidMount() {
		const {
			fetchHBInitDataAction,
			site: { siteId }
		} = this.props;
		fetchHBInitDataAction(siteId);
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
				const { refreshSlot, refreshInterval } = adUnits[0];
				this.setState({
					isError: false,
					adRefresh: refreshSlot,
					selectedRefreshRate: refreshInterval,
					oldAdUnits: adUnits
				});
			})
			.catch(err => this.setState({ isError: true }));
	};

	handleToggle = (value, event) => {
		const attributeValue = event.target.getAttribute('name');
		const name = attributeValue.split('-')[0];

		this.setState({
			[name]: value
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

		let adUnitsArr = [];
		if (!e.target.value.endsWith('.csv')) {
			this.setState({ fileName: '' });
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Only csv files are allowed',
				autoDismiss: 5
			});
		}

		this.setState({ fileName: e.target.value, file: e.target.files[0] }, () => {
			let adUnitMap = {};
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

					for (let key in adUnitMap) {
						let parentAdUnit;
						let dfpAdUnit = adUnitMap[key];
						let dfpAdunitCode = adUnitMap[key];

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

						adUnitsArr.push({ dfpAdUnit, dfpAdunitCode });
					}
					if (!parentAdUnitError) this.setState({ structuredAdUnits: adUnitsArr });
				}
			});
		});
	};

	showUploadedAdUnits = () => {
		this.setState({ show: true });
	};

	handleSave = () => {
		const { structuredAdUnits, oldAdUnits, uploadedAdUnits, fileName } = this.state;
		const {
			site: { siteId },
			showNotification
		} = this.props;

		if (!fileName) {
			showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Please select a valid Ad Unit csv file first',
				autoDismiss: 5
			});
		} else {
			let currentAdUnitsWithDfpNameAndCode = structuredAdUnits.length
				? structuredAdUnits
				: uploadedAdUnits;

			const oldAdUnitList = uploadedAdUnits.length ? uploadedAdUnits : oldAdUnits;
			const oldAdUnitsWithDfpNameAndCode = oldAdUnitList.map(
				({ refreshSlot, refreshInterval, headerBidding, sectionId, formats, isActive, ...rest }) =>
					rest
			);

			const unCommonAdUnits = differenceWith(
				oldAdUnitsWithDfpNameAndCode,
				currentAdUnitsWithDfpNameAndCode,
				isEqual
			);

			if (!unCommonAdUnits.length) {
				currentAdUnitsWithDfpNameAndCode = [
					...currentAdUnitsWithDfpNameAndCode.map(v => ({ ...v, isActive: true }))
				];
			}
			currentAdUnitsWithDfpNameAndCode = [
				...currentAdUnitsWithDfpNameAndCode.map(v => ({ ...v, isActive: true })),
				...unCommonAdUnits.map(v => ({ ...v, isActive: false }))
			];

			const { adRefresh, selectedRefreshRate } = this.state;

			const adUnits = currentAdUnitsWithDfpNameAndCode.map(v =>
				Object.assign(
					{},
					{
						...v,
						sectionId: uuid.v4(),
						refreshSlot: adRefresh,
						refreshInterval: selectedRefreshRate,
						formats: ['display', 'video'],
						headerBidding: true
					}
				)
			);

			this.setState({ isLoading: true });

			return axiosInstance
				.put(`/ops/ap-lite/${siteId}`, {
					adUnits
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

					this.setState(
						{
							isLoading: false,
							uploadedAdUnits: adUnits.map(
								({
									refreshSlot,
									refreshInterval,
									headerBidding,
									sectionId,
									formats,
									isActive,
									...rest
								}) => rest
							)
						},
						this.handleReset
					);
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
		}
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

	gamAdUnitsLabel = () => {
		return (
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
	};

	renderModal = () => {
		let showAdUnits;
		const { structuredAdUnits, show, oldAdUnits, uploadedAdUnits } = this.state;

		if (structuredAdUnits.length) {
			showAdUnits = structuredAdUnits;
		} else if (!structuredAdUnits.length && !oldAdUnits.length) {
			showAdUnits = uploadedAdUnits;
		} else {
			showAdUnits = oldAdUnits.filter(({ isActive }) => isActive !== false);
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
							{ Header: 'Ad Unit Code', accessor: 'dfpAdunitCode' }
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
		const { selectedRefreshRate, adRefresh, fileName, oldAdUnits, uploadedAdUnits } = this.state;

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
					value={fileName}
					onChange={this.handleGAM}
					onClick={event => {
						event.target.value = null;
					}}
					type="file"
					label={this.gamAdUnitsLabel()}
					size={6}
					id="gamAdUnits-text"
					style={{
						display: 'inline-block',
						float: 'right',
						width: '220',
						fontWeight: '700'
					}}
				/>

				{fileName || uploadedAdUnits.length || oldAdUnits.length ? (
					<React.Fragment>
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
		} else return null;
	}
}

export default ApLite;
