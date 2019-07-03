/* eslint-disable react/no-danger */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { Component } from 'react';
import { Panel, Table } from 'react-bootstrap';
import Loader from '../../../../../../Components/Loader';
import CustomMessage from '../../../../../../Components/CustomMessage';
import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';

class ApTag extends Component {
	state = {
		loading: false
	};

	handleToggle = value => {
		const {
			updateAppStatus,
			site: { siteId }
		} = this.props;

		this.setState({ loading: true });

		return updateAppStatus(siteId, {
			app: 'apTag',
			value
		}).then(() => this.setState({ loading: false }));
	};

	render() {
		const { site } = this.props;
		const { siteId, siteDomain, apps = {} } = site;
		const { loading } = this.state;
		const status = Object.prototype.hasOwnProperty.call(apps, 'apTag') ? apps.apTag : undefined;

		if (loading) return <Loader height="100px" />;

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
