import React, { Component } from 'react';
import { PanelGroup, Panel } from 'react-bootstrap';

import SiteBody from './SiteBody/index';
import { domanize } from '../../../../helpers/commonFunctions';

class Sites extends Component {
	state = {
		activeKey: null
	};

	handleSelect = value => {
		this.setState({
			activeKey: value
		});
	};

	render() {
		const { sites, showNotification, saveSettings, createPagegroups } = this.props;
		const { activeKey } = this.state;
		const siteIds = Object.keys(sites);

		return (
			<PanelGroup accordion id="sites-accordion" activeKey={activeKey} onSelect={this.handleSelect}>
				{siteIds.map(siteId => {
					const site = sites[siteId];
					const { siteDomain } = site;
					return (
						<Panel eventKey={siteId} key={siteId}>
							<Panel.Heading>
								<Panel.Title toggle>
									{domanize(siteDomain)} - {siteId}
								</Panel.Title>
							</Panel.Heading>
							<Panel.Body collapsible>
								<SiteBody
									site={site}
									showNotification={showNotification}
									saveSettings={saveSettings}
									createPagegroups={createPagegroups}
								/>
							</Panel.Body>
						</Panel>
					);
				})}
			</PanelGroup>
		);
	}
}

export default Sites;
