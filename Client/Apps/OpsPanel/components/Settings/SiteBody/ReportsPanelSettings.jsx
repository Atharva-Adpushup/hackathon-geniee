/* eslint-disable no-alert */
/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';

import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../Components/CustomButton/index';

class ReportsPanelSettings extends Component {
	constructor(props) {
		super(props);
		const { user } = this.props;
		const { showUniqueImpressionsReporting = false, sessionRpmReports = false } = user;

		this.state = {
			showUniqueImpressionsReporting,
			loading: false,
			sessionRpmReports
		};
	}

	handleToggle = (val, e) => {
		const { target } = e;
		const key = target.getAttribute('name').split('-')[0];
		this.setState({
			[key]: !!val
		});
	};

	handleSave = () => {
		const { showUniqueImpressionsReporting, sessionRpmReports } = this.state;
		const { updateUser, customProps } = this.props;

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
		const { loading, showUniqueImpressionsReporting, sessionRpmReports } = this.state;

		return (
			<div className="showUniqueImpressionsReporting">
				<CustomToggleSwitch
					labelText="Show Unique Impressions Reporting"
					className="u-margin-t4 u-margin-b4 u-margin-t4 negative-toggle u-cursor-pointer"
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
