/* eslint-disable react/no-danger */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import CustomMessage from '../../../../../../Components/CustomMessage';
import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../../Components/CustomButton/index';

class InnovativeAds extends Component {
	constructor(props) {
		super(props);
		const {
			site: {
				apConfigs: { poweredByBanner = false },
				apps = {}
			}
		} = props;
		const status = Object.prototype.hasOwnProperty.call(apps, 'innovativeAds')
			? apps.innovativeAds
			: undefined;

		this.state = {
			poweredByBanner,
			status,
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
		const { poweredByBanner, status } = this.state;
		const { site, updateSite } = this.props;

		this.setState({ isLoading: true });

		return updateSite(site.siteId, [
			{
				key: 'apps',
				value: {
					innovativeAds: status
				}
			},
			{
				key: 'apConfigs',
				value: {
					poweredByBanner
				}
			}
		]).then(() => this.setState({ isLoading: false }));
	};

	render() {
		const { poweredByBanner, status, isLoading } = this.state;

		const { site } = this.props;
		const { siteId, siteDomain } = site;

		return (
			<Panel.Body collapsible>
				{status === undefined ? (
					<CustomMessage
						type="error"
						header="Information"
						message="Innovative Ads Status not found. Please set app status"
						rootClassNames="u-margin-b4"
						dismissible
					/>
				) : null}
				<CustomToggleSwitch
					labelText="App Status"
					className="u-margin-b4 negative-toggle"
					checked={status}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`status-${siteId}-${siteDomain}`}
					id={`js-status-${siteId}-${siteDomain}`}
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
