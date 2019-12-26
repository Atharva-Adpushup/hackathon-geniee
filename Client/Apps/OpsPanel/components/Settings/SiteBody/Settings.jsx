/* eslint-disable no-restricted-globals */
import React, { Component } from 'react';
import { Col } from '@/Client/helpers/react-bootstrap-imports';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import FieldGroup from '../../../../../Components/Layout/FieldGroup';
import InputBox from '../../../../../Components/InputBox/index';
import CustomButton from '../../../../../Components/CustomButton/index';
import { formatDate } from '../../../../../helpers/commonFunctions';

class Settings extends Component {
	constructor(props) {
		super(props);
		const { site } = props;
		const {
			isSPA = false,
			spaPageTransitionTimeout = 0,
			adpushupPercentage = 100,
			poweredByBanner = false,
			isAdsLabelOn = false,
			adsLabel = 'Advertisement'
		} = site.apConfigs || {};
		const { revenueShare = 10 } = site.adNetworkSettings || {};

		this.state = {
			isSPA,
			spaPageTransitionTimeout,
			adpushupPercentage,
			poweredByBanner,
			isAdsLabelOn,
			adsLabel,
			revenueShare
		};
	}

	handleToggle = (value, event) => {
		const attributeValue = event.target.getAttribute('name');
		const name = attributeValue.split('-')[0];
		this.setState({
			[name]: value
		});
	};

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	handleSave = () => {
		const {
			isSPA,
			spaPageTransitionTimeout,
			adpushupPercentage,
			poweredByBanner,
			isAdsLabelOn,
			adsLabel,
			revenueShare
		} = this.state;
		const { showNotification, saveSettings, site } = this.props;
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

		return saveSettings(site.siteId, {
			apConfigs: {
				isSPA,
				spaPageTransitionTimeout: Number(spaPageTransitionTimeout),
				adpushupPercentage: Number(adpushupPercentage),
				poweredByBanner,
				isAdsLabelOn,
				adsLabel
			},
			adNetworkSettings: {
				revenueShare: Number(revenueShare)
			}
		});
	};

	render() {
		const {
			isSPA,
			spaPageTransitionTimeout,
			adpushupPercentage,
			poweredByBanner,
			isAdsLabelOn,
			adsLabel,
			revenueShare
		} = this.state;
		const { site } = this.props;
		const { siteId, siteDomain } = site;
		const effectRevenueShareDate = formatDate(+new Date(), 'subtract', 2);

		return (
			<Col xs={4} style={{ borderRight: '1px dashed #ccc' }}>
				<CustomToggleSwitch
					labelText="Powered By AdPushup"
					className="u-margin-b4 negative-toggle"
					checked={poweredByBanner}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`poweredByBanner-${siteId}-${siteDomain}`}
					id={`js-poweredByBanner-${siteId}-${siteDomain}`}
				/>
				<CustomToggleSwitch
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
				/>
				{isAdsLabelOn && (
					<InputBox
						name="adsLabel"
						value={adsLabel}
						type="text"
						onChange={this.handleChange}
						placeholder="Ads Label"
						classNames="u-margin-b4 u-padding-v3 u-padding-h3"
					/>
				)}
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
				{isSPA && (
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
				<FieldGroup
					name="revenueShare"
					value={revenueShare}
					type="number"
					label={`Revenue Share - Any changes will be effective from ${effectRevenueShareDate}`}
					onChange={this.handleChange}
					size={6}
					id={`revenueShare-input-${siteId}-${siteDomain}`}
					placeholder={`Revenue Share - Any changes will be effective from ${effectRevenueShareDate}`}
					className="u-padding-v4 u-padding-h4"
				/>
				<CustomButton variant="primary" className="pull-right" onClick={this.handleSave}>
					Save
				</CustomButton>
			</Col>
		);
	}
}

export default Settings;
