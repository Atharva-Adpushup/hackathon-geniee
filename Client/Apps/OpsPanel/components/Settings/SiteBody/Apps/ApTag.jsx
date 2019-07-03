/* eslint-disable react/no-danger */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { Component } from 'react';
import { Panel, Table } from 'react-bootstrap';

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
		const { site, updateSite } = this.props;

		this.setState({ isLoading: true });

		return updateSite(site.siteId, [
			{
				key: 'apps',
				value: {
					apTag: status
				}
			}
		]).then(() => this.setState({ isLoading: false }));
	};

	render() {
		const { site } = this.props;
		const { siteId, siteDomain, apps = {} } = site;
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

export default ApTag;
