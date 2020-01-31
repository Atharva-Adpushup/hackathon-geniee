/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component, Fragment } from 'react';
import Papa from 'papaparse';
import uuid from 'uuid';

import axiosInstance from '../../../../../../helpers/axiosInstance';
import { Panel, PanelGroup } from '@/Client/helpers/react-bootstrap-imports';
import CustomButton from '../../../../../../Components/CustomButton/index';
import FieldGroup from '../../../../../../Components/Layout/FieldGroup.jsx';
import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import SelectBox from '../../../../../../Components/SelectBox/index';
import { REFRESH_RATE_ENTRIES } from '../../../../configs/commonConsts';

const DEFAULT_STATE = {
	file: null,
	fileName: ''
};

class ApLite extends Component {
	state = {
		view: 'list',
		isLoading: false,
		adRefresh: true,
		selectedRefreshRate: REFRESH_RATE_ENTRIES[0].value,
		structuredAdUnits: [],
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
			.then(res => console.log(res))
			.catch(err => console.log(err));
	};

	handleToggle = (value, event) => {
		const attributeValue = event.target.getAttribute('name');
		const name = attributeValue.split('-')[0];

		this.setState({
			[name]: value
		});
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
			Papa.parse(this.state.file, {
				delimiter: '',
				chunkSize: 3,
				header: false,
				complete: function(responses) {
					responses.data.forEach(unit => {
						let structuredData = {};
						let dfpAdUnitName = unit[0].includes('�') ? unit[0].replace('�', '/') : unit[0];

						structuredData.dfpAdUnitName = dfpAdUnitName;
						structuredData.sectionId = uuid.v4();
						structuredData.dfpAdunitCode = unit[1];

						adUnitsArr.push(structuredData);
					});
				}
			});
			this.setState({ structuredAdUnits: adUnitsArr });
		});
	};

	handleSave = () => {
		const { structuredAdUnits } = this.state;

		const {
			site: {
				siteId,
				apps: { headerBidding }
			},
			showNotification
		} = this.props;
		const { adRefresh, selectedRefreshRate } = this.state;

		const adUnitsWithAllFields = structuredAdUnits.map(v =>
			Object.assign(
				{},
				{
					...v,
					refreshSlot: adRefresh,
					refreshInterval: selectedRefreshRate,
					headerBidding
				}
			)
		);

		let adUnits = adUnitsWithAllFields.filter(
			data =>
				data.dfpAdUnitName !== '' &&
				data.dfpAdUnitName !== 'Total' &&
				data.dfpAdUnitName !== 'Ad unit'
		);

		this.setState({ isLoading: true });

		return axiosInstance
			.put(`/ops/ap-lite/${siteId}`, {
				adUnits
			})
			.then(res => {
				showNotification({
					mode: 'success',
					title: 'Success',
					message: 'Settings saved successsfully',
					autoDismiss: 5
				});
				this.setState({ isLoading: false }, this.handleReset);
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
		const dfPNetworkNameField = adNetworkSettings.filter(val => val.networkName === 'DFP')[0] || {};
		const matchDfpAccount =
			dfPNetworkNameField.dfpAccounts.filter(val => val.code == activeDFPNetworkId)[0] || {};

		return matchDfpAccount.name;
	}
	renderView = () => {
		const styles = {
			display: 'inline-block',
			float: 'right',
			fontWeight: 'bold',
			padding: '5px 15px'
		};
		const {
			site,
			userData: { adServerSettings, adNetworkSettings },
			headerBiddingData
		} = this.props;

		const { siteId, siteDomain } = site;
		const { selectedRefreshRate, adRefresh, fileName } = this.state;

		const { setupStatus } = headerBiddingData[siteId];
		const hbStatus = this.getHbStatus(setupStatus);

		const activeDFPNetworkId = adServerSettings.hasOwnProperty('dfp')
			? adServerSettings.dfp.activeDFPNetwork
			: undefined;

		const activeDFPNetworkName =
			adNetworkSettings.length && adNetworkSettings.filter(val => val.networkName === 'DFP')
				? this.getNetworkName(adNetworkSettings, activeDFPNetworkId)
				: undefined;

		return (
			<div>
				<FieldGroup
					name="Google Ad Manager"
					value={
						activeDFPNetworkName
							? `Connected ( ${activeDFPNetworkName} ,${activeDFPNetworkId})`
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
					type="file"
					label="GAM Ad Units"
					size={6}
					id="gamAdUnits-text"
					className="u-padding-v4 u-padding-h4"
				/>
				{fileName ? (
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
					</React.Fragment>
				) : null}

				<CustomButton variant="secondary" className="pull-right u-margin-r3 u-margin-t4">
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
