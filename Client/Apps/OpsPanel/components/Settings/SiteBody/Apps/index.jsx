import React, { Component } from 'react';
import { PanelGroup, Panel, Col } from 'react-bootstrap';
import Loader from '../../../../../../Components/Loader';
import Layout from './Layout';
import ConsentManagement from './ConsentManagement';

class Apps extends Component {
	state = {
		activeKey: null
	};

	componentDidMount() {
		const { site, getAppStatuses } = this.props;
		const { apps } = site;
		if (!apps) getAppStatuses(site.siteId);
	}

	handleSelect = value => {
		this.setState({
			activeKey: value
		});
	};

	renderPanel() {
		const { activeKey } = this.state;
		const {
			site,
			fetchChannelsInfo,
			showNotification,
			updateChannelAutoOptimise,
			updateSiteAutoOptimise,
			updateAppStatus,
			updateSite
		} = this.props;
		const common = {
			activeKey,
			site,
			showNotification,
			updateAppStatus
		};
		return (
			<PanelGroup
				accordion
				id={`apps-accordion-${site.siteId}-${site.siteDomain}`}
				activeKey={activeKey}
				onSelect={this.handleSelect}
			>
				<Panel eventKey="layout">
					<Panel.Heading>
						<Panel.Title toggle>Layout App</Panel.Title>
					</Panel.Heading>
					{activeKey === 'layout' ? (
						<Layout
							{...common}
							fetchChannelsInfo={fetchChannelsInfo}
							updateChannelAutoOptimise={updateChannelAutoOptimise}
						/>
					) : null}
				</Panel>
				<Panel eventKey="consentManagement">
					<Panel.Heading>
						<Panel.Title toggle>Consent Management App</Panel.Title>
					</Panel.Heading>
					{activeKey === 'consentManagement' ? (
						<ConsentManagement {...common} updateSite={updateSite} />
					) : null}
				</Panel>
			</PanelGroup>
		);
	}

	render() {
		const {
			site: { apps }
		} = this.props;

		return <Col xs={8}>{!apps ? <Loader height="100px" /> : this.renderPanel()}</Col>;
	}
}

export default Apps;
