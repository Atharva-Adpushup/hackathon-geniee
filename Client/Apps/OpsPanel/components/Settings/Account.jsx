/* eslint-disable no-alert */
/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
import React, { Component, Fragment } from 'react';
import { Col } from '@/Client/helpers/react-bootstrap-imports';
import memoize from 'memoize-one';

import {
	DFP_ACCOUNTS_DEFAULT,
	ADPUSHUP_DFP,
	PREBID_CURRENCY_URL
} from '../../configs/commonConsts';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch/index';
import FieldGroup from '../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../Components/CustomButton/index';
import CustomMessage from '../../../../Components/CustomMessage/index';
import SelectBox from '../../../../Components/SelectBox';
import Loader from '../../../../Components/Loader/index';
import config from '../../../../config/config';

class Account extends Component {
	constructor(props) {
		super(props);
		const { user } = this.props;
		const {
			adNetworkSettings = [],
			adServerSettings: {
				dfp: {
					activeDFPParentId = false,
					activeDFPNetwork = false,
					isThirdPartyAdx = false,
					activeDFPCurrencyCode = 'Not Set'
				} = {}
			} = {}
		} = user;
		const adsense = adNetworkSettings[0] || null;
		const adsensePubId = adsense ? adsense.pubId : '';
		const activeDFP =
			activeDFPNetwork && activeDFPParentId
				? `${activeDFPNetwork}-${activeDFPParentId}-${activeDFPCurrencyCode}`
				: null;
		let dfpAccounts = [];
		let foundAdPushupDFP = false;

		adNetworkSettings.forEach(network => {
			if (network.networkName === 'DFP') {
				const { dfpAccounts: DfpAccountsFromDoc } = network;
				const currentDfpAccounts = DfpAccountsFromDoc.map(account => {
					if (!foundAdPushupDFP) {
						foundAdPushupDFP = !!(
							account.name &&
							account.name.toLowerCase() === ADPUSHUP_DFP.name &&
							account.code &&
							account.code === ADPUSHUP_DFP.code
						);
					}
					return {
						name: `${account.code} - ${account.name || 'N/A'}`,
						value: `${account.code}-${account.dfpParentId}-${account.currencyCode}`
					};
				});
				dfpAccounts = currentDfpAccounts;
			}
		});

		if (!foundAdPushupDFP || !dfpAccounts.length)
			dfpAccounts = [...dfpAccounts, ...DFP_ACCOUNTS_DEFAULT];

		this.state = {
			activeDFP,
			originalactiveDFP: activeDFP,
			isThirdPartyAdx,
			activeDFPCurrencyCode,
			adsensePubId,
			dfpAccounts,
			loading: false
		};
	}

	getActiveDFPName = memoize((adNetworkSettings = [], activeDFPNetwork, code) => {
		let response = '103512698 - AdPushup Inc.';
		const activeNetwork = activeDFPNetwork === '103512698' ? response : activeDFPNetwork;

		const dfpNetwork = adNetworkSettings.find(({ networkName }) => networkName === 'DFP') || {};
		const { dfpAccounts = [] } = dfpNetwork;

		const filteredAccounts = dfpAccounts.find(
			account => `${account.code}-${account.dfpParentId}-${account.currencyCode}` === code
		);

		response = filteredAccounts
			? `${filteredAccounts.code} - ${filteredAccounts.name || 'N/A'}`
			: activeNetwork;
		return response;
	});

	checkAdPushupGAM = value => value.toString().includes(ADPUSHUP_DFP.code);

	getPrebidGranularityMultiplier = (activeDFPNetwork, currencyCode) => {
		if (
			activeDFPNetwork === ADPUSHUP_DFP.code ||
			currencyCode.toUpperCase() === ADPUSHUP_DFP.currency.toUpperCase()
		) {
			return Promise.resolve(1);
		}

		return window
			.fetch(PREBID_CURRENCY_URL)
			.then(response => response.json())
			.then(response => {
				const { conversions: { USD = {} } = {} } = response;
				return USD[currencyCode.toUpperCase()] || 1;
			})
			.catch(err => {
				console.log('Prebid Granularity Multiplier fetch failed', err);
				return 1;
			});
	};

	handleToggle = (value, extra) => {
		const { isThirdPartyAdx } = this.state;

		let toUpdate = {};
		if (typeof extra === 'string') {
			// GAM case
			const isAdPushupGAM = this.checkAdPushupGAM(value);
			const activeDFPCurrencyCode = value.split('-')[2];
			toUpdate = {
				[extra]: value,
				activeDFPCurrencyCode,
				isThirdPartyAdx: isAdPushupGAM ? false : isThirdPartyAdx
			};
		} else {
			// ThirdParty Adx
			const identifier = extra.target.getAttribute('name').split('-')[0];
			toUpdate = {
				[identifier]: value
			};
		}

		this.setState({ ...toUpdate });
	};

	handleChange = event => {
		const { value } = event.target;
		this.setState({
			adsensePubId: value
		});
	};

	handleAdsenseSave = () => {
		const { adsensePubId } = this.state;
		const { showNotification, updateUser, customProps, user } = this.props;

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: '',
			actionInfo: 'AdSense Update'
		};

		const { adNetworkSettings = [] } = user;

		const originalAdsensePubId = adNetworkSettings[0] ? adNetworkSettings[0].pubId : null;
		const shouldUpdateAdNetworkSettings = !!(originalAdsensePubId || adsensePubId);

		if (shouldUpdateAdNetworkSettings) {
			adNetworkSettings[0] = adNetworkSettings[0] || {};
			adNetworkSettings[0].pubId = adsensePubId;
			adNetworkSettings[0].networkName = adNetworkSettings[0].networkName || 'ADSENSE';
		}
		this.setState({ loading: true });
		return updateUser(
			[
				{
					key: 'adNetworkSettings',
					value: adNetworkSettings
				}
			],
			dataForAuditLogs
		).then(() =>
			this.setState({
				loading: false
			})
		);
	};

	handleAdManagerSave = () => {
		const { activeDFP, originalactiveDFP, isThirdPartyAdx, adsensePubId } = this.state;
		const { showNotification, updateUser, customProps, user } = this.props;
		const { adServerSettings = {} } = user;

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: '',
			actionInfo: 'AdManager Update'
		};

		if (originalactiveDFP === null) {
			if (activeDFP === null) {
				return showNotification({
					mode: 'error',
					title: 'Invalid Value',
					message: 'Please select an active DFP',
					autoDismiss: 10
				});
			} else if (activeDFP !== null) {
				if (
					!window.confirm(
						'Setting Google Ad Manager is an irrevocable action. Are you sure about the selected Google Ad Manager? '
					)
				) {
					return false;
				}
			}
		}

		const [activeDFPNetwork, activeDFPParentId, activeDFPCurrencyCode] = activeDFP.split('-');
		let updatedAdServerSettings = {
			...adServerSettings,
			dfp: {
				...adServerSettings.dfp,
				isThirdPartyAdx,
				activeDFPNetwork,
				activeDFPParentId,
				activeDFPCurrencyCode
			}
		};

		this.setState({ loading: true });

		return this.getPrebidGranularityMultiplier(activeDFPNetwork, activeDFPCurrencyCode)
			.then(prebidGranularityMultiplier => {
				updatedAdServerSettings = {
					...updatedAdServerSettings,
					dfp: {
						...updatedAdServerSettings.dfp,
						prebidGranularityMultiplier
					}
				};
				return updateUser(
					[
						{
							key: 'adServerSettings',
							value: updatedAdServerSettings
						}
					],
					dataForAuditLogs
				);
			})
			.then(() =>
				this.setState({
					originalactiveDFP: activeDFP,
					loading: false
				})
			);
	};

	render() {
		const {
			adsensePubId,
			dfpAccounts,
			activeDFP,
			isThirdPartyAdx,
			activeDFPCurrencyCode,
			originalactiveDFP,
			loading
		} = this.state;

		const { user, sites } = this.props;
		const { adServerSettings } = user;
		const { dfp = {} } = adServerSettings;
		const { activeDFPNetwork } = dfp;

		const siteIds = Object.keys(sites);

		const apLiteSites = siteIds.filter(siteId => {
			const site = sites[siteId];
			const { apps = {} } = site;
			if (apps.hasOwnProperty('apLite') && apps.apLite) return apps;
		});

		const { adNetworkSettings = [] } = user;
		const activeDFPName = this.getActiveDFPName(adNetworkSettings, activeDFPNetwork, activeDFP);
		const isDFPSetup = !!activeDFP;
		const disableThirdPartyAdx = isDFPSetup && this.checkAdPushupGAM(activeDFP);

		if (loading) return <Loader height="200px" />;

		return (
			<Col xs={12} style={{ margin: '0 auto' }}>
				{isDFPSetup ? null : (
					<CustomMessage
						type="error"
						header="Setup Incomplete"
						message={
							"<p style='font-size: 16px'>Google Ad Manager Setup Incomplete. Please setup Publisher's Google Ad Manager or select AdPushup's Google Ad Manager below for Ad Syncing. For intergrations, please click <a href='/integrations'>here</a>.<p>"
						}
						rootClassNames="u-margin-b4"
						dismissible
					/>
				)}
				<FieldGroup
					name="adsensePubId-dfpSettings"
					value={adsensePubId}
					type="text"
					label="Adsense Pub Id"
					onChange={this.handleChange}
					size={6}
					id="adsensePubId-input"
					placeholder="Adsense Pub Id"
					className="u-padding-v4 u-padding-h4"
				/>
				{isDFPSetup && originalactiveDFP !== null ? (
					<FieldGroup
						name="Active DFP"
						value={activeDFPName}
						isTextOnly
						textOnlyStyles={{
							display: 'inline-block',
							float: 'right',
							fontWeight: 'bold',
							border: '1px solid rgb(176, 174, 174)',
							padding: '5px 15px'
						}}
						label="Active Google Ad Manager"
						size={6}
						id="activeDFP-text"
						className="u-padding-v4 u-padding-h4"
					/>
				) : (
					<Fragment>
						<p className="u-text-bold">Select Google Ad Manager</p>
						{apLiteSites.length &&
						!adNetworkSettings.find(val => val.networkName === 'DFP') &&
						!activeDFPNetwork ? (
							<CustomMessage
								type="error"
								header="No Third Party DFP Added"
								message={
									"<p style='font-size: 16px'>Please add a Third Party DFP Network since AP Lite is enabled on one of your sites.<p>"
								}
								rootClassNames="u-margin-b4"
							/>
						) : (
							<SelectBox
								onSelect={this.handleToggle}
								options={
									!apLiteSites.length
										? dfpAccounts
										: dfpAccounts.filter(
												val =>
													val.name.split('-')[0].trim() !== config.ADPUSHUP_NETWORK_ID.toString()
										  )
								}
								title="Select Google Ad Manager"
								selected={activeDFP}
								id="accounts-dfp-select"
								wrapperClassName="u-margin-v4"
								dataKey="activeDFP"
							/>
						)}
					</Fragment>
				)}
				<FieldGroup
					name="Google Ad Manager Currency"
					value={activeDFPCurrencyCode}
					isTextOnly
					textOnlyStyles={{
						display: 'inline-block',
						float: 'right',
						fontWeight: 'bold',
						border: '1px solid rgb(176, 174, 174)',
						padding: '5px 15px'
					}}
					label="Google Ad Manager Currency"
					size={6}
					id="googleAdManager-input"
					className="u-padding-v4 u-padding-h4"
				/>
				<CustomToggleSwitch
					labelText={`Third Party AdX ${disableThirdPartyAdx ? '(Disabled)' : ''}`}
					className="u-margin-t4 u-margin-b4 negative-toggle u-cursor-pointer"
					checked={isThirdPartyAdx}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name="isThirdPartyAdx"
					id="js-isThirdPartyAdx"
					disabled={disableThirdPartyAdx}
				/>
				{isDFPSetup && originalactiveDFP !== null ? null : (
					<CustomButton
						variant="primary"
						className="pull-right u-margin-l4 u-margin-b4"
						onClick={this.handleAdManagerSave}
					>
						Sync Ad Manager
					</CustomButton>
				)}
				<CustomButton
					variant="primary"
					className="pull-right u-margin-b4"
					onClick={this.handleAdsenseSave}
				>
					Sync AdSense
				</CustomButton>
			</Col>
		);
	}
}

export default Account;
