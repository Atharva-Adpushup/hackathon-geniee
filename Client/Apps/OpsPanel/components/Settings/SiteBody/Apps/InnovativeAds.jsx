/* eslint-disable react/no-danger */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { Component } from 'react';
import { Panel } from '@/Client/helpers/react-bootstrap-imports';
import CustomMessage from '../../../../../../Components/CustomMessage';
import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../../Components/CustomButton/index';

class InnovativeAds extends Component {
	constructor(props) {
		super(props);
		const {
			site: { apps = {} }
		} = props;
		const status = Object.prototype.hasOwnProperty.call(apps, 'innovativeAds')
			? apps.innovativeAds
			: undefined;

		this.state = {
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
		const { status } = this.state;
		const { site, updateSite, updateAppStatus } = this.props;

		this.setState({ isLoading: true });

		return updateAppStatus(site.siteId, {
			app: 'innovativeAds',
			value: status
		}).then(() => this.setState({ isLoading: false }));
	};

	render() {
		const { status, isLoading } = this.state;

		const {
			site: { siteId, siteDomain },
			resetTab
		} = this.props;

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

export default InnovativeAds;
