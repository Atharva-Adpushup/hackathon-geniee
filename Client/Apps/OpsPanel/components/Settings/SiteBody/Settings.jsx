/* eslint-disable no-restricted-globals */
import React, { Component} from 'react';
import { MultiSelect } from 'react-multi-select-component';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import FieldGroup from '../../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../../Components/CustomButton/index';
import ColorPicker from '../../../../AmpSettings/components/helper/ColorPicker';
import config from '../../../../../config/config';
import siteService from '../../../../../services/siteService';
import {
	GA_ACCESS_EMAIL_OPTIONS,
	GA_VERSION_OPTIONS,
	GA_EVENT_SAMPLING,
	TYPE_TEXT,
	TYPE_NUMBER,
	POWERED_BY_BANNER,
	OUTBRAIN_DISABLED,
	OUTBRAIN_DISABLED_OPTIONS,
	SITE_LEVEL_REFRESH_TYPE
} from '../../../configs/commonConsts';
import { FC_SETTINGS } from '../../../../../constants/opsPanel';

import SelectBox from '../../../../../Components/SelectBox';

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
			flyingCarpetSettings = {
				CSS: {
					top: 30
				},
				label: {
					enabled: true,
					color: FC_SETTINGS.LABEL_COLOR,
					backgroundColor: FC_SETTINGS.LABEL_BG_COLOR
				}
			}, // default val

			poweredByBanner = {},
			disableAutoAdpushupLabel = false,
			isAdsLabelOn = false,
			adsLabel = 'Advertisement',
			hbAnalytics = false,
			isUrlReportingEnabled = false,
			cmpAvailable = false,
			mergeReport = false,
			videoAdsDashboard = false,
			forceRenderPostBid = false,
			outbrainDisabled = OUTBRAIN_DISABLED.DEFAULT_VALUES,
			siteLevelRefreshType = SITE_LEVEL_REFRESH_TYPE[0].value,
			isWeeklyEmailReportsEnabled = false,
			isDailyEmailReportsEnabled = false,
			enableGAAnalytics = false,
			geoEdgeScriptEnabled = false,
			gaConfigs: {
				gaTrackingId = '',
				viewId = '',
				accessEmail = 'support@adpushup.com',
				gaVersion = 3
			} = {}
		} = site.apConfigs || {};
		const { revenueShare = 10 } = site.adNetworkSettings || {};
		const { utmReporting = false, urlReporting = false } = site;
		const status = Object.prototype.hasOwnProperty.call(apps, 'apLite') ? apps.apLite : undefined;
		const isPnPEnabled = Object.prototype.hasOwnProperty.call(apps, 'pnp') ? apps.pnp : false;
		const selectedAdTypes = this.getSelectedAdTypes(poweredByBanner);
		const selectedOutbrainDisabledTypes = this.getSelectedOutbrainDisabledTypes(outbrainDisabled);
		const { label: fcLabel = {} } = flyingCarpetSettings;
		const isfcLabelEnabled = Object.prototype.hasOwnProperty.call(fcLabel, 'enabled')
			? fcLabel.enabled
			: true;
		const isSiteSyncingErrorFull = false;
		this.state = {
			isSPA,
			spaButUsingHook,
			spaPageTransitionTimeout,
			adpushupPercentage,
			flyingCarpetTopOffset: flyingCarpetSettings?.CSS?.top,
			flyingCarpetLabel: isfcLabelEnabled,
			flyingCarpetLabelColor: flyingCarpetSettings?.label?.color || FC_SETTINGS.LABEL_COLOR,
			flyingCarpetLabelBackgroundColor:
				flyingCarpetSettings?.label?.backgroundColor || FC_SETTINGS.LABEL_BG_COLOR,
			disableAutoAdpushupLabel,
			isAdsLabelOn,
			adsLabel,
			revenueShare,
			status,
			hbAnalytics,
			urlUtm: isUrlReportingEnabled && utmReporting && urlReporting,
			cmpEnabled: !cmpAvailable,
			mergeReport,
			videoAdsDashboard,
			forceRenderPostBid,
			selectedOutbrainDisabledTypes: [...selectedOutbrainDisabledTypes],
			isWeeklyEmailReportsEnabled,
			isDailyEmailReportsEnabled,
			enableGAAnalytics,
			gaTrackingId,
			viewId,
			accessEmail,
			gaVersion,
			pnp: isPnPEnabled,
			selectedAdTypes: [...selectedAdTypes],
			siteLevelRefreshType,
			geoEdgeScriptEnabled,
			isSiteSyncingErrorFull
		};
	}

	componentDidMount(){
		siteService.getExistingSitesInQueueStatus()
		.then((res)=> this.setState({isSiteSyncingErrorFull: res.response}))
		.catch((error)=> console.log(error))
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
			const { status } = this.state;
			if (name === 'urlUtm' && value && status) {
				// eslint-disable-next-line no-alert
				alert('Kindly reach out to tech-team for creating key-values in publishers GAM.');
			}
			if (name === 'isSPA' && value === false) {
				return {
					[name]: value,
					spaButUsingHook: false,
					spaPageTransitionTimeout: 0
				};
			}
			if (name === 'pnp') {
				// eslint-disable-next-line no-alert
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
			if (name === 'flyingCarpetLabel') {
				return {
					[name]: value
				};
			}

			if (name !== 'apLite') {
				return {
					[name]: value
				};
			}
			if (
				name === 'apLite' &&
				adServerSettings.dfp &&
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

	handleGaInputChange = e => {
		const updatedViewId = e === 4 ? '' : this.state.viewId;
		this.setState({ gaVersion: e, viewId: updatedViewId });
	};

	handlePoweredByBannerMultiSelect = selectedAdTypes => {
		this.setState({ selectedAdTypes });
	};

	handleOutbrainDisabledMultiSelect = selectedOutbrainDisabledTypes => {
		this.setState({ selectedOutbrainDisabledTypes });
	};

	handleOnSelect = (value, key) => {
		this.setState({ [key]: value });
	};

	getPoweredByBannerConfig = selectedAdTypes => {
		const poweredByBannerConfig = {};
		selectedAdTypes.forEach(selectedElement => {
			poweredByBannerConfig[selectedElement.value] = true;
		});

		return poweredByBannerConfig;
	};

	getOutbrainDisabledConfig = selectedOutbrainDisabledTypes => {
		const outbrainDisabledConfig = { ...OUTBRAIN_DISABLED.DEFAULT_VALUES };
		selectedOutbrainDisabledTypes.forEach(selectedElement => {
			outbrainDisabledConfig[selectedElement.value] = true;
		});
		return { ...outbrainDisabledConfig };
	};

	getSelectedAdTypes = poweredByBanner => {
		const selectedAdTypes = [];
		const poweredByBannerSupportedAdTypes = Object.keys(poweredByBanner);

		poweredByBannerSupportedAdTypes.forEach(adType => {
			if (poweredByBanner[adType]) {
				selectedAdTypes.push({ label: adType, value: adType });
			}
		});

		return selectedAdTypes;
	};

	getSelectedOutbrainDisabledTypes = outbrainDisabled => {
		const selectedOutbrainDisabledTypes = [];

		const supportedOutbrainDisabledTypes = Object.keys(OUTBRAIN_DISABLED.DEFAULT_VALUES);

		if (typeof outbrainDisabled === 'boolean' && outbrainDisabled) {
			supportedOutbrainDisabledTypes.forEach(outbrainDisabledType => {
				selectedOutbrainDisabledTypes.push({
					label: outbrainDisabledType,
					value: outbrainDisabledType
				});
			});
			return selectedOutbrainDisabledTypes;
		}

		supportedOutbrainDisabledTypes.forEach(outbrainDisabledType => {
			if (outbrainDisabled[outbrainDisabledType]) {
				selectedOutbrainDisabledTypes.push({
					label: outbrainDisabledType,
					value: outbrainDisabledType
				});
			}
		});

		return selectedOutbrainDisabledTypes;
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

	handleSave = () => {
		const {
			isSPA,
			spaButUsingHook,
			spaPageTransitionTimeout,
			adpushupPercentage,
			flyingCarpetTopOffset,
			flyingCarpetLabel,
			flyingCarpetLabelColor,
			flyingCarpetLabelBackgroundColor,
			isAdsLabelOn,
			disableAutoAdpushupLabel,
			adsLabel,
			revenueShare,
			hbAnalytics,
			urlUtm,
			cmpEnabled,
			mergeReport,
			videoAdsDashboard,
			forceRenderPostBid,
			selectedOutbrainDisabledTypes,
			siteLevelRefreshType,
			isWeeklyEmailReportsEnabled,
			isDailyEmailReportsEnabled,
			enableGAAnalytics,
			gaTrackingId,
			viewId,
			accessEmail,
			gaVersion,
			selectedAdTypes,
			geoEdgeScriptEnabled
		} = this.state;
		const poweredByBanner = this.getPoweredByBannerConfig(selectedAdTypes);
		const outbrainDisabled = this.getOutbrainDisabledConfig(selectedOutbrainDisabledTypes);
		const gaConfigs = {
			gaTrackingId,
			viewId,
			accessEmail,
			gaEventSampling: GA_EVENT_SAMPLING,
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

		const saveConfig = {
			apConfigs: {
				isSPA,
				spaButUsingHook,
				spaPageTransitionTimeout: Number(spaPageTransitionTimeout),
				adpushupPercentage: Number(adpushupPercentage),
				flyingCarpetSettings: {
					CSS: { top: Number(flyingCarpetTopOffset) },
					label: {
						enabled: flyingCarpetLabel,
						color: flyingCarpetLabelColor,
						backgroundColor: flyingCarpetLabelBackgroundColor
					}
				},
				poweredByBanner,
				isAdsLabelOn,
				disableAutoAdpushupLabel,
				adsLabel,
				hbAnalytics,
				cmpAvailable: !cmpEnabled,
				mergeReport,
				videoAdsDashboard,
				forceRenderPostBid,
				outbrainDisabled,
				isWeeklyEmailReportsEnabled,
				isDailyEmailReportsEnabled,
				gaConfigs,
				siteLevelRefreshType,
				enableGAAnalytics,
				geoEdgeScriptEnabled
			},

			adNetworkSettings: {
				revenueShare: Number(revenueShare)
			}
		};

		if (urlUtm) {
			saveConfig.apConfigs.isUrlReportingEnabled = true;
			saveConfig.urlReporting = true;
			saveConfig.utmReporting = true;
		} else if (!urlUtm && site.apConfigs.isUrlReportingEnabled) {
			saveConfig.apConfigs.isUrlReportingEnabled = false;
			saveConfig.urlReporting = false;
			saveConfig.utmReporting = false;
		}
		return saveSettings(site.siteId, saveConfig, dataForAuditLogs);
	};

	handleAmpDvcForceBuild = () => {
		const { site = {}, showNotification } = this.props;

		const { siteId } = site;

		siteService
			.forceAmpDvcBuild(siteId)
			.then(res => {
				const data = {
					mode: 'success',
					title: 'Success',
					autoDismiss: 5,
					message: (res.data && res.data.message) || 'AMP DVC Script build in progress'
				};
				showNotification(data);
			})
			.catch(() => {
				const data = {
					mode: 'error',
					title: 'Error',
					autoDismiss: 5,
					message: 'Error building AMP DVC Script'
				};
				showNotification(data);
			});
	};

	render() {
		const {
			isSPA,
			spaButUsingHook,
			spaPageTransitionTimeout,
			adpushupPercentage,
			flyingCarpetTopOffset,
			flyingCarpetLabel,
			flyingCarpetLabelColor,
			flyingCarpetLabelBackgroundColor,
			status,
			disableAutoAdpushupLabel,
			hbAnalytics,
			urlUtm,
			// cmpEnabled,
			mergeReport,
			videoAdsDashboard,
			forceRenderPostBid,
			selectedOutbrainDisabledTypes,
			isDailyEmailReportsEnabled,
			isWeeklyEmailReportsEnabled,
			enableGAAnalytics,
			gaTrackingId,
			viewId,
			accessEmail,
			gaVersion,
			pnp,
			selectedAdTypes,
			siteLevelRefreshType,
			geoEdgeScriptEnabled
		} = this.state;

		const { handlePoweredByBannerMultiSelect, handleOutbrainDisabledMultiSelect } = this;
		const { site } = this.props;

		const { siteId, siteDomain, dataFeedActive = true } = site;
		const isGaVersionFour = gaVersion === 4;
		const gaPropertyIdText = 'GA Property Id';
		const gaTrackingIdText = 'GA Tracking Id';
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
						onChange={handlePoweredByBannerMultiSelect}
						disableSearch
						hasSelectAll={false}
					/>
				</div>
				<CustomToggleSwitch
					labelText="Disable Max Impresion Unit Branding"
					className="u-margin-b4 negative-toggle"
					checked={!!disableAutoAdpushupLabel}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`disableAutoAdpushupLabel-${siteId}-${siteDomain}`}
					id={`js-disableAutoAdpushupLabel-switch-${siteId}-${siteDomain}`}
				/>
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
				{/* Removed as this can be handled through GAM */}
				{/* <CustomToggleSwitch
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
				/> */}
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
				<CustomToggleSwitch
					labelText="URL/UTM"
					className="u-margin-b4 negative-toggle"
					checked={urlUtm}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`urlUtm-${siteId}-${siteDomain}`}
					id={`js-url-utm-switch-${siteId}-${siteDomain}`}
				/>
				<CustomToggleSwitch
					labelText="Video Ads Dashboard"
					className="u-margin-b4 negative-toggle"
					checked={videoAdsDashboard}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`videoAdsDashboard-${siteId}-${siteDomain}`}
					id={`js-videoAdsDashboard-switch-${siteId}-${siteDomain}`}
				/>
				<CustomToggleSwitch
					labelText="Run Header Bidding Only"
					className="u-margin-b4 negative-toggle"
					checked={forceRenderPostBid}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					// disabled AdX
					name={`forceRenderPostBid-${siteId}-${siteDomain}`}
					id={`js-forceRenderPostBid-switch-${siteId}-${siteDomain}`}
				/>

				<CustomToggleSwitch
					labelText="GeoEdge Script"
					className="u-margin-b4 negative-toggle"
					checked={geoEdgeScriptEnabled}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`geoEdgeScriptEnabled-${siteId}-${siteDomain}`}
					id={`js-geoEdgeScriptEnabled-${siteId}-${siteDomain}`}
				/>

				<div className="outbrain-disabled">
					<h1>Outbrain Disabled</h1>
					<MultiSelect
						options={OUTBRAIN_DISABLED_OPTIONS}
						value={selectedOutbrainDisabledTypes}
						onChange={handleOutbrainDisabledMultiSelect}
						disableSearch
						hasSelectAll={false}
					/>
				</div>
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

				<div className="site-level-refresh">
					<h1>Site Level Refresh</h1>
					<SelectBox
						selected={siteLevelRefreshType}
						options={SITE_LEVEL_REFRESH_TYPE}
						onSelect={this.handleOnSelect}
						id="select-entry"
						title="Refresh Type"
						dataKey="siteLevelRefreshType"
						style={{ marginLeft: 'auto', width: '20%' }}
					/>
				</div>
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
							type={isGaVersionFour ? TYPE_NUMBER : TYPE_TEXT}
							label={isGaVersionFour ? gaPropertyIdText : gaTrackingIdText}
							onChange={this.handleChange}
							size={6}
							id={`gaTrackingId-${siteId}-${siteDomain}`}
							placeholder={isGaVersionFour ? gaPropertyIdText : gaTrackingIdText}
							className="u-padding-v4 u-padding-h4"
						/>
						<FieldGroup
							name="viewId"
							value={isGaVersionFour ? '' : viewId}
							type="text"
							label="View Id"
							onChange={this.handleChange}
							size={6}
							id={`viewId-${siteId}-${siteDomain}`}
							placeholder="View Id"
							className="u-padding-v4 u-padding-h4"
							disabled={isGaVersionFour}
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
							onChange={this.handleGaInputChange}
							size={6}
							id={`gaVersion-${siteId}-${siteDomain}`}
							placeholder="GA Version"
							className="u-padding-v4 u-padding-h4"
							itemCollection={GA_VERSION_OPTIONS}
						/>
					</>
				)}

				{/* Flying Carpet Setting  */}
				{site && site.apConfigs && site.apConfigs.flyingCarpetSettings && (
					<>
						<b>Flying Carpet Settings : </b>

						<CustomToggleSwitch
							labelText="Advertisement Label"
							className="u-margin-t4 u-margin-b4 negative-toggle"
							checked={flyingCarpetLabel}
							onChange={this.handleToggle}
							layout="horizontal"
							size="m"
							on="Yes"
							off="No"
							defaultLayout={false}
							name={`flyingCarpetLabel-switch-${siteId}-${siteDomain}`}
							id={`flyingCarpetLabel-switch-${siteId}-${siteDomain}`}
						/>
						{flyingCarpetLabel && (
							<>
								<div className="powered-by-adpushup u-margin-t4">
									<b>Label Background Color</b>
									<ColorPicker
										value={flyingCarpetLabelBackgroundColor || '#fff'}
										handleChange={selectedColor => {
											const { hex } = selectedColor;
											this.setState({ flyingCarpetLabelBackgroundColor: hex });
										}}
									/>
								</div>

								<div className="powered-by-adpushup u-margin-t4">
									<b>Label Color</b>
									<ColorPicker
										value={flyingCarpetLabelColor || '#fff'}
										handleChange={selectedColor => {
											const { hex } = selectedColor;
											this.setState({ flyingCarpetLabelColor: hex });
										}}
									/>
								</div>
							</>
						)}
						<FieldGroup
							name="flyingCarpetTopOffset"
							value={flyingCarpetTopOffset}
							type="number"
							label="Flying Carpet Top Offset(px)"
							onChange={this.handleChange}
							id={`flyingCarpetTopOffset-input-${siteId}-${siteDomain}`}
							placeholder="Default 30"
							className="u-padding-v4 u-padding-h4"
						/>
					</>
				)}

				<div style={{ display: 'block' }}>
					<CustomButton variant="primary" className="u-margin-t3" onClick={this.handleForceBuild}>
						Force adpushup.js Build
					</CustomButton>{' '}
					<CustomButton
						variant="primary"
						className="u-margin-t3"
						onClick={this.handleAmpDvcForceBuild}
					>
						Force build AMP DVC script
					</CustomButton>
				</div>
				<Row>
					<Col>
						<CustomButton variant="primary" onClick={this.handleSave} className="u-margin-t3">
							Save
						</CustomButton>
					</Col>
				</Row>
			</Col>
		);
	}
}

export default Settings;
