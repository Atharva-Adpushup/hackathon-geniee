/* eslint-disable react/no-danger */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { Component, Fragment } from 'react';
import { Panel, Table } from 'react-bootstrap';
import Loader from '../../../../../../Components/Loader';
import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../../Components/CustomButton/index';

class InnovativeAds extends Component {
	constructor(props) {
		super(props);
		const { site } = props;
		// const { poweredByBanner = false } = site.apConfigs || {};
		// const { innovativeAds = false } = site.apps || {};

		this.state = {
			poweredByBanner: false,
			innovativeAds: false,
			isLoading: false
		};
	}

	handleToggle = (value, event) => {
		const attributeValue = event.target.getAttribute('name');
		const name = attributeValue.split('-')[0];

		this.setState({
			[name]: value
		});
	};

	handleSave = () => {
		const { poweredByBanner, innovativeAds } = this.state;
		const { saveSettings, site, updateAppStatus } = this.props;

		this.setState({ isLoading: true });

		return updateAppStatus(site.siteId, {
			app: 'innovativeAds',
			innovativeAds
		})
			.then(() =>
				saveSettings(site.siteId, {
					apConfigs: {
						poweredByBanner
					},
					adNetworkSettings: {}
				})
			)
			.then(this.setState({ isLoading: false }));
	};

	render() {
		const { poweredByBanner, innovativeAds, isLoading } = this.state;

		const { site } = this.props;
		const { cmsInfo, apConfigs, siteId, siteDomain, apps } = site;

		return (
			<Panel.Body collapsible>
				<CustomToggleSwitch
					labelText="App Status"
					className="u-margin-b4 negative-toggle"
					checked={innovativeAds}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`appStatus-${siteId}-${siteDomain}`}
					id={`js-appStatus-${siteId}-${siteDomain}`}
				/>

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
					name={`poweredByBanner-${siteId}-${siteDomain}-poweredByBanner`}
					id={`js-poweredByBanner-${siteId}-${siteDomain}-poweredByBanner`}
				/>

				<CustomButton
					variant="primary"
					className="pull-right"
					onClick={this.handleSave}
					showSpinner={isLoading}
				>
					Save
				</CustomButton>
			</Panel.Body>
		);
	}
}

export default InnovativeAds;
