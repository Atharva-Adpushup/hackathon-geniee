/* eslint-disable no-restricted-globals */
import React, { Component } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import FieldGroup from '../../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../../Components/CustomButton/index';
import config from '../../../../../config/config';
import siteService from '../../../../../services/siteService';
import {
	GA_ACCESS_EMAIL_OPTIONS,
	GA_VERSION_OPTIONS,
	POWERED_BY_BANNER
} from '../../../configs/commonConsts';

class Settings extends Component {
	constructor(props) {
		super(props);
		const { site } = props;
		const { apps = {} } = site;

		const {
			isSPA = false,
			spaButUsingHook = false,
			spaPageTransitionTimeout = 0,
			adpushupPercentage = 100,
			poweredByBanner = {},
			isAdsLabelOn = false,
			adsLabel = 'Advertisement',
			hbAnalytics = false,
			cmpAvailable = false,
			mergeReport = false,
			isWeeklyEmailReportsEnabled = false,
			isDailyEmailReportsEnabled = false,
			enableGAAnalytics = false,
			gaConfigs: {
				gaTrackingId = '',
				viewId = '',
				accessEmail = 'support@adpushup.com',
				gaVersion = 3
			} = {}
		} = site.apConfigs || {};
		const { revenueShare = 10 } = site.adNetworkSettings || {};
		const status = Object.prototype.hasOwnProperty.call(apps, 'apLite') ? apps.apLite : undefined;
		const isPnPEnabled = Object.prototype.hasOwnProperty.call(apps, 'pnp') ? apps.pnp : false;

		this.state = {
			isSPA,
			spaButUsingHook,
			spaPageTransitionTimeout,
			adpushupPercentage,
			poweredByBanner,
			isAdsLabelOn,
			adsLabel,
			revenueShare,
			status,
			hbAnalytics,
			cmpEnabled: !cmpAvailable,
			mergeReport,
			isWeeklyEmailReportsEnabled,
			isDailyEmailReportsEnabled,
			enableGAAnalytics,
			gaTrackingId,
			viewId,
			accessEmail,
			gaVersion,
			pnp: isPnPEnabled,
			selectedAdTypes: [...this.getPoweredByBannerConfig(poweredByBanner)]
		};
	}

	handleToggle = (value, event) => {
		const attributeValue = event.target.getAttribute('name');
		const {
			userData: { adServerSettings },
			updateAppStatus,
			site,
			dataForAuditLogs
		} = this.props;

		const name = attributeValue.split('-')[0];

		this.setState(() => {
			if (name === 'isSPA' && value === false) {
				return {
					[name]: value,
					spaButUsingHook: false,
					spaPageTransitionTimeout: 0
				};
			}
			if (name === 'pnp') {
				const shouldUpdate = value ? confirm('Are you sure you wanna enable PnP?') : true;
				if (shouldUpdate) {
					return updateAppStatus(
						site.siteId,
						{
							app: 'pnp',
							value
						},
						{
							...dataForAuditLogs,
							actionInfo: `Updated: ${name} - ${value}`
						}
					).then(() => this.setState({ [name]: value }));
				}
			}

			if (name !== 'apLite') {
				return {
					[name]: value
				};
			}
			if (
				name === 'apLite' &&
				adServerSettings.hasOwnProperty('dfp') &&
				adServerSettings.dfp.activeDFPNetwork === config.ADPUSHUP_NETWORK_ID.toString() &&
				value
			) {
				alert('AP Lite can not be enabled');

				return {
					[name]: false
				};
			}
			if (name === 'apLite' && value) {
				const val = confirm('Are you sure you want to enable AP Lite ?');
				if (val) {
					return updateAppStatus(
						site.siteId,
						{
							app: 'apLite',
							value
						},
						{
							...dataForAuditLogs,
							actionInfo: `Updated: ${name}`
						}
					).then(() => this.setState({ status: value, [name]: value }));
				}
				return { [name]: false };
			}
			alert(`you can't disable AP Lite`);
			return { [name]: true };
		});
	};

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	handleMultiSelect = selectedAdTypes => {
		const poweredByBannerConfig = {};
		selectedAdTypes.forEach(selectedElement => {
			poweredByBannerConfig[selectedElement.value] = true;
		});
		this.setState({
			poweredByBanner: poweredByBannerConfig,
			selectedAdTypes: selectedAdTypes
		});
	};

	handleForceBuild = () => {
		const { site, showNotification, dataForAuditLogs } = this.props;

		siteService
			.forceApBuild(site.siteId, {
				...dataForAuditLogs,
				actionInfo: `Force Build`
			})
			.then(res => {
				const data = {
					mode: 'success',
					title: 'Success',
					autoDismiss: 5,
					message: (res.data && res.data.message) || 'AdPushup build in progress'
				};
				showNotification(data);
			})
			.catch(() => {
				const data = {
					mode: 'error',
					title: 'Error',
					autoDismiss: 5,
					message: 'Error pushing adpushup build'
				};
				showNotification(data);
			});
	};

	getPoweredByBannerConfig = poweredByBanner => {
		const selectedAdTypes = [];

		Object.keys(poweredByBanner).forEach(adType => {
			if (poweredByBanner[adType]) {
				selectedAdTypes.push({ label: adType, value: adType });
			}
		});

		return selectedAdTypes;
	};

	handleSave = () => {
		const {
			isSPA,
			spaButUsingHook,
			spaPageTransitionTimeout,
			adpushupPercentage,
			poweredByBanner,
			isAdsLabelOn,
			adsLabel,
			revenueShare,
			hbAnalytics,
			cmpEnabled,
			mergeReport,
			isWeeklyEmailReportsEnabled,
			isDailyEmailReportsEnabled,
			enableGAAnalytics,
			gaTrackingId,
			viewId,
			accessEmail,
			gaVersion
		} = this.state;
		const gaConfigs = {
			gaTrackingId,
			viewId,
			accessEmail,
			gaEventSampling: 1,
			gaVersion
		};
		const { showNotification, saveSettings, site, dataForAuditLogs } = this.props;
		const isTransitionInValid = isSPA && isNaN(Number(spaPageTransitionTimeout));
		const isAdPushupPercentageInValid =
			isNaN(Number(adpushupPercentage)) || adpushupPercentage > 100 || adpushupPercentage < 0;
		const isRevenueShareInValid = isNaN(Number(revenueShare)) || revenueShare > 100;
		const isAdsLabelInValid = isAdsLabelOn && !adsLabel.trim().length;
		const isDataWrong =
			isTransitionInValid ||
			isAdPushupPercentageInValid ||
			isAdsLabelInValid ||
			isRevenueShareInValid;

		if (isDataWrong) {
			const data = {
				mode: 'error',
				title: 'Invalid Value',
				autoDismiss: 5,
				message: 'Some Error Occurred'
			};
			if (isTransitionInValid) {
				data.message = 'Invalid SPA Transition Value';
			} else if (isAdPushupPercentageInValid) {
				data.message = 'Invalid AdPushup Percentage';
			} else if (isAdsLabelInValid) {
				data.message = 'Invalid Ads Label';
			} else if (isRevenueShareInValid) {
				data.message = 'Invalid Revenue Share';
			}
			return showNotification(data);
		}

		return saveSettings(
			site.siteId,
			{
				apConfigs: {
					isSPA,
					spaButUsingHook,
					spaPageTransitionTimeout: Number(spaPageTransitionTimeout),
					adpushupPercentage: Number(adpushupPercentage),
					poweredByBanner,
					isAdsLabelOn,
					adsLabel,
					hbAnalytics,
					cmpAvailable: !cmpEnabled,
					mergeReport,
					isWeeklyEmailReportsEnabled,
					isDailyEmailReportsEnabled,
					gaConfigs,
					enableGAAnalytics
				},

				adNetworkSettings: {
					revenueShare: Number(revenueShare)
				}
			},
			dataForAuditLogs
		);
	};

	render() {
		const {
			isSPA,
			spaButUsingHook,
			spaPageTransitionTimeout,
			adpushupPercentage,
			// poweredByBanner,
			// isAdsLabelOn,
			// adsLabel,
			// revenueShare,
			status,
			hbAnalytics,
			cmpEnabled,
			mergeReport,
			isDailyEmailReportsEnabled,
			isWeeklyEmailReportsEnabled,
			enableGAAnalytics,
			gaTrackingId,
			viewId,
			accessEmail,
			gaVersion,
			pnp,
			selectedAdTypes
		} = this.state;
		const { site } = this.props;

		const { siteId, siteDomain, dataFeedActive = true } = site;
		// const effectRevenueShareDate = formatDate(+new Date(), 'subtract', 2);

		return (
			<Col xs={4} style={{ borderRight: '1px dashed #ccc' }}>
				<CustomToggleSwitch
					labelText="AP Lite"
					className="u-margin-b4 negative-toggle"
					checked={status}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`apLite-${siteId}-${siteDomain}`}
					id={`js-apLite-${siteId}-${siteDomain}`}
				/>
				<CustomToggleSwitch
					labelText="PnP"
					className="u-margin-b4 negative-toggle"
					checked={pnp}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`pnp-${siteId}-${siteDomain}`}
					id={`js-pnp-${siteId}-${siteDomain}`}
				/>
				<CustomToggleSwitch
					labelText="Merge Pnp Report"
					className="u-margin-b4 negative-toggle"
					checked={mergeReport}
					onChange={this.handleToggle}
					layout="horizontal"
					disabled={!(status && pnp)}
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`mergeReport-${siteId}-${siteDomain}`}
					id={`js-mergeReport-${siteId}-${siteDomain}`}
				/>

				<div className="powered-by-adpushup">
					<h1>Powered By AdPushup</h1>
					<MultiSelect
						options={POWERED_BY_BANNER}
						value={selectedAdTypes}
						onChange={this.handleMultiSelect}
						disableSearch
						hasSelectAll={false}
					/>
				</div>

				{/* <CustomToggleSwitch
					labelText="Ads Label"
					className="u-margin-b4 negative-toggle"
					checked={isAdsLabelOn}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`isAdsLabelOn-${siteId}-${siteDomain}`}
					id={`js-isAdsLabelOn-${siteId}-${siteDomain}`}
				/>  */}
				{/* {isAdsLabelOn && (
					<InputBox
						name="adsLabel"
						value={adsLabel}
						type="text"
						onChange={this.handleChange}
						placeholder="Ads Label"
						classNames="u-margin-b4 u-padding-v3 u-padding-h3"
					/>
				)} */}
				<CustomToggleSwitch
					labelText="Inject CMP"
					className="u-margin-b4 negative-toggle"
					checked={cmpEnabled}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`cmpEnabled-${siteId}-${siteDomain}`}
					id={`js-cmpEnabled-${siteId}-${siteDomain}`}
				/>
				<CustomToggleSwitch
					labelText="SPA"
					className="u-margin-b4 negative-toggle"
					checked={isSPA}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`isSPA-${siteId}-${siteDomain}`}
					id={`js-spa-switch-${siteId}-${siteDomain}`}
				/>
				<CustomToggleSwitch
					labelText="HB Analytics"
					className="u-margin-b4 negative-toggle"
					checked={hbAnalytics}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`hbAnalytics-${siteId}-${siteDomain}`}
					id={`js-hbAnalytics-switch-${siteId}-${siteDomain}`}
				/>
				{!config.disableDailyWeeklySnapshots && (
					<CustomToggleSwitch
						labelText="Email Daily Reports Updates"
						className="u-margin-b4 negative-toggle"
						checked={isDailyEmailReportsEnabled}
						onChange={this.handleToggle}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout
						name={`isDailyEmailReportsEnabled-${siteId}-${siteDomain}`}
						id={`isDailyEmailReportsEnabled-${siteId}-${siteDomain}`}
						disabled={!dataFeedActive}
					/>
				)}

				{!config.disableDailyWeeklySnapshots && (
					<CustomToggleSwitch
						labelText="Email Weekly Reports Updates"
						className="u-margin-b4 negative-toggle"
						checked={isWeeklyEmailReportsEnabled}
						onChange={this.handleToggle}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout
						name={`isWeeklyEmailReportsEnabled-${siteId}-${siteDomain}`}
						id={`isWeeklyEmailReportsEnabled-${siteId}-${siteDomain}`}
						disabled={!dataFeedActive}
					/>
				)}
				{isSPA && (
					<React.Fragment>
						<CustomToggleSwitch
							labelText="SPA But Using Hook"
							className="u-margin-b4 negative-toggle"
							checked={spaButUsingHook}
							onChange={this.handleToggle}
							layout="horizontal"
							size="m"
							on="Yes"
							off="No"
							defaultLayout
							name={`spaButUsingHook-${siteId}-${siteDomain}`}
							id={`js-spaButUsingHook-${siteId}-${siteDomain}`}
						/>
						<FieldGroup
							name="spaPageTransitionTimeout"
							value={spaPageTransitionTimeout}
							type="text"
							label="SPA Transition(ms)"
							onChange={this.handleChange}
							size={6}
							id={`spa-transition-input-${siteId}-${siteDomain}`}
							placeholder="SPA Transition(ms)"
							className="u-padding-v4 u-padding-h4"
						/>
					</React.Fragment>
				)}
				<FieldGroup
					name="adpushupPercentage"
					value={adpushupPercentage}
					type="number"
					label="AdPushup Percentage"
					onChange={this.handleChange}
					size={6}
					id={`adpushupPercentage-input-${siteId}-${siteDomain}`}
					placeholder="AdPushup Percentage"
					className="u-padding-v4 u-padding-h4"
				/>
				{/* <FieldGroup
					name="revenueShare"
					value={revenueShare}
					type="number"
					label={`Revenue Share - Any changes will be effective from ${effectRevenueShareDate}`}
					onChange={this.handleChange}
					size={6}
					id={`revenueShare-input-${siteId}-${siteDomain}`}
					placeholder={`Revenue Share - Any changes will be effective from ${effectRevenueShareDate}`}
					className="u-padding-v4 u-padding-h4"
				/> */}

				{!config.GA_DISABLED_SITES.includes(siteId) && (
					<CustomToggleSwitch
						labelText="Enable GA Analytics"
						className="u-margin-b4 negative-toggle"
						checked={enableGAAnalytics}
						onChange={this.handleToggle}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout
						name={`enableGAAnalytics-${siteId}-${siteDomain}`}
						id={`enableGAAnalytics-${siteId}-${siteDomain}`}
						disabled={!dataFeedActive}
					/>
				)}

				{!config.GA_DISABLED_SITES.includes(siteId) && enableGAAnalytics && (
					<>
						<FieldGroup
							name="gaTrackingId"
							value={gaTrackingId}
							type="text"
							label="GA Tracking Id"
							onChange={this.handleChange}
							size={6}
							id={`gaTrackingId-${siteId}-${siteDomain}`}
							placeholder="GA Tracking Id"
							className="u-padding-v4 u-padding-h4"
						/>
						<FieldGroup
							name="viewId"
							value={viewId}
							type="text"
							label="View Id"
							onChange={this.handleChange}
							size={6}
							id={`viewId-${siteId}-${siteDomain}`}
							placeholder="View Id"
							className="u-padding-v4 u-padding-h4"
						/>
						<FieldGroup
							name="accessEmail"
							value={accessEmail}
							type="toggle-dropdown-button"
							label="Access Email"
							onChange={value => this.setState({ accessEmail: value })}
							size={6}
							id={`accessEmail-${siteId}-${siteDomain}`}
							placeholder="Access Email"
							className="u-padding-v4 u-padding-h4"
							itemCollection={GA_ACCESS_EMAIL_OPTIONS}
						/>
						<FieldGroup
							name="gaVersion"
							value={gaVersion}
							type="toggle-dropdown-button"
							label="GA Version"
							onChange={value => this.setState({ gaVersion: value })}
							size={6}
							id={`gaVersion-${siteId}-${siteDomain}`}
							placeholder="GA Version"
							className="u-padding-v4 u-padding-h4"
							itemCollection={GA_VERSION_OPTIONS}
						/>
					</>
				)}

				<Row>
					<CustomButton variant="primary" className="pull-left" onClick={this.handleForceBuild}>
						Force adpushup.js Build
					</CustomButton>
					<CustomButton variant="primary" className="pull-right" onClick={this.handleSave}>
						Save
					</CustomButton>
				</Row>
			</Col>
		);
	}
}

export default Settings;
