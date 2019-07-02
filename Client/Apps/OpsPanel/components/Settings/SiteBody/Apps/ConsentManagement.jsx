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
import Loader from '../../../../../../Components/Loader/index';

class ConsentManagement extends Component {
	constructor(props) {
		super(props);
		const {
			site: { apps = {}, gdpr = GDPR }
		} = props;
		let stringifiedGdpr = '{}';

		try {
			stringifiedGdpr = JSON.stringify(gdpr);
		} catch (e) {
			console.log('Invalid GDPR');
		}

		this.state = {
			status: Object.prototype.hasOwnProperty.call(apps, 'consentManagement')
				? apps.consentManagement
				: undefined,
			config: stringifiedGdpr,
			loading: false
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
		const { status, config } = this.state;
		const { updateAppStatus, updateSite, showNotification, site } = this.props;
		const { siteId } = site;

		let parsedConfig;

		try {
			parsedConfig = JSON.parse(config);
			parsedConfig.compliance = status;
		} catch (e) {
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				autoDismiss: 5,
				message: 'Invalid config value'
			});
		}

		this.setState({ loading: true });

		return updateAppStatus(siteId, {
			app: 'consentManagement',
			value: status
		})
			.then(() =>
				updateSite(siteId, [
					{ key: 'gdpr', value: parsedConfig, replace: true, requireResponse: false }
				])
			)
			.then(() => this.setState({ loading: false }));
	};

	render() {
		const { site } = this.props;
		const { siteId, siteDomain } = site;
		const { status, config, loading } = this.state;

		if (loading) return <Loader height="150px" />;

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
