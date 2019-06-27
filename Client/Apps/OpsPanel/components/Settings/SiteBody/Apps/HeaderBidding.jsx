/* eslint-disable no-console */
/* eslint-disable react/no-danger */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';

import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import CustomMessage from '../../../../../../Components/CustomMessage/index';
import FieldGroup from '../../../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../../../Components/CustomButton/index';

class HeaderBidding extends Component {
	componentDidMount() {
		const { bidders, fetchAllBiddersAction, site } = this.props;

		if (!bidders) fetchAllBiddersAction(site.siteId);
	}

	handleToggle = value => {
		this.setState({
			status: value
		});
	};

	handleSave = () => {
		const { status, config } = this.state;
		const { updateAppStatus, updateSite, showNotification, site } = this.props;
		const { siteId } = site;

		let parsedConfig;

		try {
			parsedConfig = JSON.parse(config);
		} catch (e) {
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				autoDismiss: 5,
				message: 'Invalid config value'
			});
		}

		return updateAppStatus(siteId, {
			app: 'consentManagement',
			value: status
		}).then(() => {
			parsedConfig.compliance = status;
			return updateSite(siteId, {
				key: 'gdpr',
				value: parsedConfig,
				replace: true
			});
		});
	};

	render() {
		const { site } = this.props;
		const { siteId, siteDomain } = site;
		const { status, config } = this.state;

		return (
			<Panel.Body collapsible>
				{status === undefined ? (
					<CustomMessage
						type="error"
						header="Information"
						message="Header Bidding Status not found. Please set app status"
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
					name={`appStatus-${siteId}-${siteDomain}`}
					id={`js-appStatus-${siteId}-${siteDomain}`}
				/>
				<CustomButton variant="primary" className="pull-right" onClick={this.handleSave}>
					Save
				</CustomButton>
			</Panel.Body>
		);
	}
}

export default HeaderBidding;
