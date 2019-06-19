/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component } from 'react';
import { Panel, PanelGroup } from 'react-bootstrap';

import Listing from './Listing';
import Creation from './Creation';

class Pagegroups extends Component {
	state = { view: 'list' };

	updateView = (e, defaultView = 'list') => {
		this.setState({
			view: e ? e.target.getAttribute('data-view') : defaultView
		});
	};

	handleSelect = value => {
		this.setState({
			activeKey: value
		});
	};

	renderView = () => {
		const { view } = this.state;
		const {
			site,
			fetchChannelsInfo,
			createChannels,
			showNotification,
			updatePagegroupPattern,
			deletePagegroup
		} = this.props;
		switch (view) {
			default:
			case 'list':
				return (
					<Listing
						site={site}
						updateView={this.updateView}
						fetchChannelsInfo={fetchChannelsInfo}
						showNotification={showNotification}
						updatePagegroupPattern={updatePagegroupPattern}
						deletePagegroup={deletePagegroup}
					/>
				);
			case 'create':
				return (
					<Creation
						site={site}
						updateView={this.updateView}
						createChannels={createChannels}
						showNotification={showNotification}
					/>
				);
		}
	};

	render() {
		const { site } = this.props;
		const { siteId, siteDomain } = site;
		const { activeKey } = this.state;
		return (
			<div className="u-margin-t4">
				<PanelGroup
					accordion
					id={`pagegroup-panel-${siteId}-${siteDomain}`}
					activeKey={activeKey}
					onSelect={this.handleSelect}
				>
					<Panel eventKey="pagegroups">
						<Panel.Heading>
							<Panel.Title toggle>Pagegroups</Panel.Title>
						</Panel.Heading>
						{activeKey === 'pagegroups' ? (
							<Panel.Body collapsible>{this.renderView()}</Panel.Body>
						) : null}
					</Panel>
				</PanelGroup>
			</div>
		);
	}
}

export default Pagegroups;
