import React, { Component } from 'react';
import { PanelGroup, Panel } from 'react-bootstrap';

import SiteBody from './SiteBody/index';
import Empty from '../../../../Components/Empty/index';
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
		const { sites, showNotification, saveSettings } = this.props;
		const { activeKey } = this.state;
		const siteIds = Object.keys(sites);

		if (!siteIds.length) return <Empty message="Seems like you haven't added any website" />;

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
							{activeKey === siteId ? (
								<Panel.Body collapsible>
									<SiteBody
										site={site}
										showNotification={showNotification}
										saveSettings={saveSettings}
									/>
								</Panel.Body>
							) : null}
						</Panel>
					);
				})}
			</PanelGroup>
		);
	}
}

export default Sites;
