/* eslint-disable no-console */
/* eslint-disable react/no-danger */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';

import { GDPR } from '../../../../configs/commonConsts';
import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import CustomMessage from '../../../../../../Components/CustomMessage/index';
import FieldGroup from '../../../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../../../Components/CustomButton/index';

class ConsentManagement extends Component {
	constructor(props) {
		super(props);
		const {
			site: { apps = {}, gdpr = GDPR }
		} = props;
		let stringifiedGdpr;

		try {
			stringifiedGdpr = JSON.stringify(gdpr);
		} catch (e) {
			console.log('Invalid GDPR');
		}

		this.state = {
			status: apps.consentManagement || undefined,
			config: stringifiedGdpr
		};
	}

	handleToggle = value => {
		this.setState({
			status: value
		});
	};

	handleChange = event => {
		const { value } = event.target;
		this.setState({
			config: value
		});
	};

	handleSave = () => {
		console.log('Saved');
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
						message="Consent Management Status not found. Please set app status"
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
				<FieldGroup
					id={`gdpr-${siteId}-${siteDomain}`}
					label="Cookie Control Config"
					type="text"
					name={`gdpr-${siteId}-${siteDomain}`}
					placeholder="Cookie Control Config"
					className="u-padding-v3 u-padding-h3"
					onChange={this.handleChange}
					value={config}
					componentClass="textarea"
					style={{ minHeight: '200px' }}
				/>
				<CustomButton variant="primary" className="pull-right" onClick={this.handleSave}>
					Save
				</CustomButton>
			</Panel.Body>
		);
	}
}

export default ConsentManagement;
