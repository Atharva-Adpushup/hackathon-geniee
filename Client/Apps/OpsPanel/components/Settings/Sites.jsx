/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component, Fragment } from 'react';
import { PanelGroup, Panel } from 'react-bootstrap';

import SiteBody from './SiteBody/index';
import Empty from '../../../../Components/Empty/index';
import SiteStatus from './SiteStatus';
import { domanize } from '../../../../helpers/commonFunctions';

class Sites extends Component {
	constructor(props) {
		super(props);
		const { sites = [] } = props;
		const activeKey = Object.keys(sites)[0] || null;
		this.state = {
			activeKey,
			show: false,
			currentSite: null
		};
	}

	handleSelect = value => {
		this.setState({
			activeKey: value
		});
	};

	modalToggle = e => {
		let siteId = null;
		if (e) {
			e.stopPropagation();
			const { target } = e;
			siteId = target.getAttribute('data-siteid');
		}
		const { show } = this.state;

		this.setState({
			show: !show,
			currentSite: siteId
		});
	};

	render() {
		const { sites, showNotification, saveSettings } = this.props;
		const { activeKey, show, currentSite } = this.state;
		const siteIds = Object.keys(sites);

		if (!siteIds.length) return <Empty message="Seems like you haven't added any website" />;

		return (
			<Fragment>
				<PanelGroup
					accordion
					id="sites-accordion"
					activeKey={activeKey}
					onSelect={this.handleSelect}
				>
					{siteIds.map(siteId => {
						const site = sites[siteId];
						const { siteDomain } = site;
						return (
							<Panel eventKey={siteId} key={siteId}>
								<Panel.Heading>
									<Panel.Title toggle>
										{domanize(siteDomain)} - {siteId}
										<span
											onClick={this.modalToggle}
											data-siteid={siteId}
											style={{ float: 'right' }}
											role="button"
										>
											Check Status
										</span>
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
				{show ? <SiteStatus show={show} site={currentSite} modalToggle={this.modalToggle} /> : null}
			</Fragment>
		);
	}
}

export default Sites;
