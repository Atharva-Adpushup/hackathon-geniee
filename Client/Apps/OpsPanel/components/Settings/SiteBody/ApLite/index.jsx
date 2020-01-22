/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component, Fragment } from 'react';
import { Panel, PanelGroup } from '@/Client/helpers/react-bootstrap-imports';
import CustomButton from '../../../../../../Components/CustomButton/index';
import FieldGroup from '../../../../../../Components/Layout/FieldGroup.jsx';
import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import SelectBox from '../../../../../../Components/SelectBox/index';
import { REFRESH_RATE_ENTRIES } from '../../../../configs/commonConsts';

class ApLite extends Component {
	state = { view: 'list', adRefresh: true, selectedRefreshRate: REFRESH_RATE_ENTRIES[0].value };

	handleSelect = value => {
		this.setState({
			activeKey: value
		});
	};

	handleToggle = (value, event) => {
		const attributeValue = event.target.getAttribute('name');
		const name = attributeValue.split('-')[0];

		this.setState({
			[name]: value
		});
	};

	onSelect = (value, key) => {
		this.setState({ [key]: value });
	};

	getNetworkName(adNetworkSettings, activeDFPNetworkId) {
		const dfPNetworkNameField = adNetworkSettings.filter(val => val.networkName === 'DFP')[0] || {};
		const matchDfpAccount =
			dfPNetworkNameField.dfpAccounts.filter(val => val.code == activeDFPNetworkId)[0] || {};

		return matchDfpAccount.name;
	}
	renderView = () => {
		const styles = {
			display: 'inline-block',
			float: 'right',
			fontWeight: 'bold',
			padding: '5px 15px'
		};
		const {
			site,
			userData: { adServerSettings, adNetworkSettings }
		} = this.props;

		const { siteId, siteDomain } = site;
		const { selectedRefreshRate, adRefresh } = this.state;

		const activeDFPNetworkId = adServerSettings.hasOwnProperty('dfp')
			? adServerSettings.dfp.activeDFPNetwork
			: undefined;

		const activeDFPNetworkName =
			adNetworkSettings.length && adNetworkSettings.filter(val => val.networkName === 'DFP')
				? this.getNetworkName(adNetworkSettings, activeDFPNetworkId)
				: undefined;

		return (
			<div>
				<FieldGroup
					name="Google Ad Manager"
					value={
						activeDFPNetworkName
							? `Connected ( ${activeDFPNetworkName} ,${activeDFPNetworkId})`
							: 'Not Connected'
					}
					isTextOnly
					textOnlyStyles={styles}
					label="Google Ad Manager"
					size={6}
					id="googleAdManager-text"
					className="u-padding-v4 u-padding-h4"
				/>
				<FieldGroup
					name="HB App"
					value="hello"
					isTextOnly
					textOnlyStyles={styles}
					label="HB App"
					size={6}
					id="hbApp-text"
					className="u-padding-v4 u-padding-h4"
				/>
				<FieldGroup
					name="GAM Ad Units"
					value="hello"
					isTextOnly
					textOnlyStyles={styles}
					label="GAM Ad Units"
					size={6}
					id="gamAdUnits-text"
					className="u-padding-v4 u-padding-h4"
				/>

				<CustomToggleSwitch
					labelText="Ad Refresh"
					className="u-margin-b4 negative-toggle"
					checked={adRefresh}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`adRefresh-${siteId}-${siteDomain}`}
					id={`js-adRefresh-${siteId}-${siteDomain}`}
				/>

				<div className="refresh-rate" style={{ display: 'flex' }}>
					<p className="u-text-bold u-margin-b4">Refresh Rate</p>
					<SelectBox
						selected={selectedRefreshRate}
						options={REFRESH_RATE_ENTRIES}
						onSelect={this.onSelect}
						id="select-entry"
						title="Select Entry"
						dataKey="selectedRefreshRate"
						reset
						style={{ marginLeft: 'auto', width: '20%' }}
						className="refresh-rate"
					/>
				</div>
				<CustomButton variant="secondary" className="pull-right u-margin-r3 u-margin-t4">
					Cancel
				</CustomButton>
				<CustomButton
					type="submit"
					variant="primary"
					className="pull-right u-margin-r3 u-margin-t4"
				>
					Save
				</CustomButton>
			</div>
		);
	};

	render() {
		const { site } = this.props;
		const { siteId, siteDomain, apps = {} } = site;
		const { activeKey } = this.state;
		if (apps.apLite) {
			return (
				<div className="u-margin-t4">
					<PanelGroup
						accordion
						id={`apLite-panel-${siteId}-${siteDomain}`}
						activeKey={activeKey}
						onSelect={this.handleSelect}
					>
						<Panel eventKey="apLite">
							<Panel.Heading>
								<Panel.Title toggle>AP Lite</Panel.Title>
							</Panel.Heading>
							{activeKey === 'apLite' ? (
								<Panel.Body collapsible>{this.renderView()}</Panel.Body>
							) : null}
						</Panel>
					</PanelGroup>
				</div>
			);
		} else return null;
	}
}

export default ApLite;
