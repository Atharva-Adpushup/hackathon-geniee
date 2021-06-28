/* eslint-disable no-alert */
/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';

import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../Components/CustomButton/index';
import FieldGroup from '../../../../../Components/Layout/FieldGroup';

class ReportsPanelSettings extends Component {
	constructor(props) {
		super(props);
		const { user } = this.props;
		const { showUniqueImpressionsReporting = false, sessionRpmReports = false, mcm = {} } = user;
		const { isMcmEnabled = false, childPublisherId = '' } = mcm;

		this.state = {
			showUniqueImpressionsReporting,
			loading: false,
			sessionRpmReports,
			isMcmEnabled,
			childPublisherId
		};
	}

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	handleToggle = (val, e) => {
		const { target } = e;
		const key = target.getAttribute('name').split('-')[0];
		this.setState({
			[key]: !!val
		});
	};

	handleSave = () => {
		const {
			showUniqueImpressionsReporting,
			sessionRpmReports,
			childPublisherId,
			isMcmEnabled
		} = this.state;
		const { updateUser, customProps, showNotification } = this.props;
		if (isMcmEnabled && childPublisherId === '') {
			return showNotification({
				mode: 'error',
				title: 'Invalid Value',
				message: 'Please enter the Child Publisher Id to Save',
				autoDismiss: 5
			});
		}

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: ''
		};

		this.setState({ loading: true });

		return updateUser(
			[
				{
					key: 'showUniqueImpressionsReporting',
					value: showUniqueImpressionsReporting
				},
				{
					key: 'sessionRpmReports',
					value: sessionRpmReports
				},
				{
					key: 'mcm',
					value: {
						isMcmEnabled,
						childPublisherId
					}
				}
			],
			dataForAuditLogs
		).then(() =>
			this.setState({
				loading: false
			})
		);
	};

	render() {
		const {
			loading,
			showUniqueImpressionsReporting,
			sessionRpmReports,
			isMcmEnabled,
			childPublisherId
		} = this.state;

		return (
			<div className="showUniqueImpressionsReporting">
				<CustomToggleSwitch
					labelText="Show Unique Impressions Reporting"
					className="u-margin-t4 u-margin-b4 negative-toggle u-cursor-pointer"
					checked={showUniqueImpressionsReporting}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name="showUniqueImpressionsReporting"
					id="js-showUniqueImpressionsReporting"
				/>
				<CustomToggleSwitch
					labelText="Session RPM Reports"
					className="u-margin-b4 negative-toggle u-cursor-pointer"
					checked={sessionRpmReports}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name="sessionRpmReports"
					id="js-sessionRpmReports"
				/>
				<CustomToggleSwitch
					labelText="Enable MCM"
					className="u-margin-b4 negative-toggle u-cursor-pointer"
					checked={isMcmEnabled}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name="isMcmEnabled"
					id="js-isMcmEnabled"
				/>
				<FieldGroup
					name="childPublisherId"
					value={childPublisherId}
					type="text"
					label="Child Publisher ID"
					onChange={this.handleChange}
					size={6}
					id="childPublisherId-input"
					placeholder="Child Publisher ID"
					className="u-padding-v4 u-padding-h4"
					disabled={!isMcmEnabled && true}
				/>
				<CustomButton
					variant="primary"
					className="pull-right u-margin-r3"
					onClick={this.handleSave}
					showSpinner={loading}
				>
					Save
				</CustomButton>
			</div>
		);
	}
}

export default ReportsPanelSettings;
