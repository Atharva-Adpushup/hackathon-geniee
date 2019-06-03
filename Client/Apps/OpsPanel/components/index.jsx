import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Nav, NavItem } from 'react-bootstrap';

import { OP_NAV_ITEMS, OP_NAV_ITEMS_INDEXES, OP_NAV_ITEMS_VALUES } from '../configs/commonConsts';
import ActionCard from '../../../Components/ActionCard';
import Loader from '../../../Components/Loader';
import SitesMapping from './SitesMapping';

class OpsPanel extends Component {
	state = {
		redirectUrl: ''
	};

	getActiveTab = () => {
		const {
			customProps: { activeTab }
		} = this.props;

		return activeTab;
	};

	handleNavSelect = value => {
		const computedRedirectUrl = `/ops-panel`;
		let redirectUrl = '';

		switch (Number(value)) {
			case 1:
				redirectUrl = `${computedRedirectUrl}`;
				break;

			case 2:
				redirectUrl = `${computedRedirectUrl}/live-sites`;
				break;

			default:
				break;
		}

		this.setState({ redirectUrl });
	};

	renderContent() {
		const activeTab = this.getActiveTab();

		switch (activeTab) {
			default:
			case OP_NAV_ITEMS_INDEXES.SITES_MAPPING:
				return <SitesMapping {...this.props} />;
			case OP_NAV_ITEMS_INDEXES.LIVE_SITES_MAPPING:
				return 'Live Sites Mapping';
		}
	}

	render() {
		const { redirectUrl } = this.state;
		const activeTab = this.getActiveTab();
		const activeItem = OP_NAV_ITEMS[activeTab];

		if (redirectUrl) {
			return <Redirect to={{ pathname: redirectUrl }} />;
		}
		return (
			<ActionCard>
				{/* {!meta.fetched ? (
					<Loader />
				) : ( */}
				<React.Fragment>
					<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
						<NavItem eventKey={1}>{OP_NAV_ITEMS_VALUES.SITES_MAPPING}</NavItem>
						<NavItem eventKey={2}>{OP_NAV_ITEMS_VALUES.LIVE_SITES_MAPPING}</NavItem>
					</Nav>
					{this.renderContent()}
				</React.Fragment>
				{/* )} */}
			</ActionCard>
		);
	}
}

export default OpsPanel;
