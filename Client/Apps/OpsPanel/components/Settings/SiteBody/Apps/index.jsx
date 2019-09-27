import React, { Component } from 'react';
import { PanelGroup, Panel, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Loader from '../../../../../../Components/Loader';
import Layout from './Layout';
import ConsentManagement from './ConsentManagement';
import HeaderBidding from './HeaderBidding';
import ApTag from './ApTag';
import InnovativeAds from './InnovativeAds';

class Apps extends Component {
	state = {
		activeKey: null
	};

	componentDidMount() {
		const { site, getAppStatuses } = this.props;
		const { apps } = site;
		if (!apps) getAppStatuses(site.siteId);
	}

	handleSelect = (value = null) => {
		this.setState({
			activeKey: value
		});
	};

	handleEditorRedirection = e => {
		e.preventDefault();
		e.stopPropagation();

		const {
			site: { siteId }
		} = this.props;

		const a = document.createElement('a');
		a.href = `//${window.location.host}/api/visualEditor/${siteId}`;
		a.setAttribute('target', '_blank');
		document.body.appendChild(a);
		a.click();
		a.remove();
	};

	renderPanel() {
		const { activeKey } = this.state;
		const {
			site,
			bidders,
			fetchChannelsInfo,
			showNotification,
			updateChannelAutoOptimise,
			updateSiteAutoOptimise,
			updateAppStatus,
			updateSite,
			fetchAllBiddersAction,
			updateBidderAction
		} = this.props;
		const common = {
			activeKey,
			site,
			showNotification,
			updateAppStatus,
			resetTab: this.handleSelect
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
						<Panel.Title toggle className="app-panel-title">
							Layout
						</Panel.Title>
						<section className="app-link">
							<Link to={`/sites/${site.siteId}/apps/layout`} className="u-margin-r3">
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip id={`tooltip-layout-link-${site.siteId}`}>Go to Layout App</Tooltip>
									}
									key={`app-layout-link-${site.siteId}`}
								>
									<FontAwesomeIcon icon="link" className="u-text-red" size="lg" />
								</OverlayTrigger>
							</Link>
							<a
								href={`api/visualEditor/${site.siteId}`}
								className="u-margin-r2"
								onClick={this.handleEditorRedirection}
							>
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip id={`tooltip-layout-editor-link-${site.siteId}`}>Go to Editor</Tooltip>
									}
									key={`app-layout-editor-link-${site.siteId}`}
								>
									<FontAwesomeIcon icon="code" className="u-text-red" size="lg" />
								</OverlayTrigger>
							</a>
						</section>
					</Panel.Heading>
					{activeKey === 'layout' ? (
						<Layout
							{...common}
							fetchChannelsInfo={fetchChannelsInfo}
							updateChannelAutoOptimise={updateChannelAutoOptimise}
							updateSiteAutoOptimise={updateSiteAutoOptimise}
						/>
					) : null}
				</Panel>
				<Panel eventKey="consentManagement">
					<Panel.Heading>
						<Panel.Title toggle>Consent Management</Panel.Title>
					</Panel.Heading>
					{activeKey === 'consentManagement' ? (
						<ConsentManagement {...common} updateSite={updateSite} />
					) : null}
				</Panel>
				<Panel eventKey="headerBidding">
					<Panel.Heading>
						<Panel.Title toggle className="app-panel-title">
							Header Bidding
						</Panel.Title>
						<Link to={`/sites/${site.siteId}/apps/header-bidding`} className="u-margin-r3 app-link">
							<OverlayTrigger
								placement="top"
								overlay={
									<Tooltip id={`tooltip-header-bidding-link-${site.siteId}`}>
										Go to Header Bidding App
									</Tooltip>
								}
								key={`app-header-bidding-link-${site.siteId}`}
							>
								<FontAwesomeIcon icon="link" className="u-text-red" size="lg" />
							</OverlayTrigger>
						</Link>
					</Panel.Heading>
					{activeKey === 'headerBidding' ? (
						<HeaderBidding
							{...common}
							bidders={bidders}
							fetchAllBiddersAction={fetchAllBiddersAction}
							updateBidderAction={updateBidderAction}
						/>
					) : null}
				</Panel>
				<Panel eventKey="apTag">
					<Panel.Heading>
						<Panel.Title toggle className="app-panel-title">
							AP Tag
						</Panel.Title>
						<Link to={`/sites/${site.siteId}/apps/ap-tag`} className="u-margin-r3 app-link">
							<OverlayTrigger
								placement="top"
								overlay={
									<Tooltip id={`tooltip-ap-tag-link-${site.siteId}`}>Go to ApTag App</Tooltip>
								}
								key={`app-ap-tag-link-${site.siteId}`}
							>
								<FontAwesomeIcon icon="link" className="u-text-red" size="lg" />
							</OverlayTrigger>
						</Link>
					</Panel.Heading>
					{activeKey === 'apTag' ? <ApTag {...common} updateSite={updateSite} /> : null}
				</Panel>
				<Panel eventKey="innovativeAds">
					<Panel.Heading>
						<Panel.Title toggle className="app-panel-title">
							Innovative Ads
						</Panel.Title>
						<Link to={`/sites/${site.siteId}/apps/innovative-ads`} className="u-margin-r3 app-link">
							<OverlayTrigger
								placement="top"
								overlay={
									<Tooltip id={`tooltip-innovative-ads-link-${site.siteId}`}>
										Go to Innovative Ads App
									</Tooltip>
								}
								key={`app-innovative-ads-link-${site.siteId}`}
							>
								<FontAwesomeIcon icon="link" className="u-text-red" size="lg" />
							</OverlayTrigger>
						</Link>
					</Panel.Heading>
					{activeKey === 'innovativeAds' ? (
						<InnovativeAds {...common} updateSite={updateSite} />
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
