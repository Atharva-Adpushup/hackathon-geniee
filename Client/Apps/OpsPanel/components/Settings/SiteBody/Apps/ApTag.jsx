/* eslint-disable react/no-danger */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { Component, Fragment } from 'react';
import { Panel, Table } from 'react-bootstrap';
import Loader from '../../../../../../Components/Loader';
import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';

class ApTag extends Component {
	handleToggle = (value, event) => {
		const attributeValue = event.target.getAttribute('name');
		const values = attributeValue.split('-');
		const { updateAppStatus } = this.props;

		const siteId = values[1];
		updateAppStatus(siteId, {
			app: 'apTag',
			value
		});
	};

	render() {
		const { site } = this.props;
		const { cmsInfo, siteId, siteDomain, apps } = site;
		const { channelsInfo } = cmsInfo;

		return (
			<Panel.Body collapsible>
				<CustomToggleSwitch
					labelText="App Status"
					className="u-margin-b4 negative-toggle"
					checked={apps.apTag}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`appStatus-${siteId}-${siteDomain}`}
					id={`js-appStatus-${siteId}-${siteDomain}`}
				/>
			</Panel.Body>
		);
	}
}

export default ApTag;
