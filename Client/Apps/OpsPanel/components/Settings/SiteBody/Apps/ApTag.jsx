/* eslint-disable react/no-danger */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { Component } from 'react';
import { Panel, Table } from '@/Client/helpers/react-bootstrap-imports';

import CustomMessage from '../../../../../../Components/CustomMessage';
import CustomButton from '../../../../../../Components/CustomButton';

import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';

class ApTag extends Component {
	constructor(props) {
		super(props);
		const {
			site: { apps = {} }
		} = props;
		const status = Object.prototype.hasOwnProperty.call(apps, 'apTag') ? apps.apTag : undefined;

		this.state = {
			isLoading: false,
			status
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
		const { status } = this.state;
		const { site, updateSite, updateAppStatus, dataForAuditLogs } = this.props;

		this.setState({ isLoading: true });

		return updateAppStatus(
			site.siteId,
			{
				app: 'apTag',
				value: status
			},
			{
				...dataForAuditLogs,
				actionInfo: `Updated AP Tag`
			}
		).then(() => this.setState({ isLoading: false }));
	};

	render() {
		const { site, resetTab } = this.props;
		const { siteId, siteDomain } = site;
		const { status, isLoading } = this.state;

		return (
			<Panel.Body collapsible>
				{status === undefined ? (
					<CustomMessage
						type="error"
						header="Information"
						message="ApTag Status not found. Please set app status"
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
				<CustomButton variant="secondary" className="pull-right" onClick={resetTab}>
					Cancel
				</CustomButton>
				<CustomButton
					variant="primary"
					className="pull-right u-margin-r3"
					onClick={this.handleSave}
					showSpinner={isLoading}
				>
					Save
				</CustomButton>
			</Panel.Body>
		);
	}
}

export default ApTag;
