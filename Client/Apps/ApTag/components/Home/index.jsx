import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Nav, NavItem } from 'react-bootstrap';
// import ActionCard from '../../../../Components/ActionCard/index';
import AdCodeGeneratorContainer from '../../containers/AdCodeGeneratorContainer';
import AdListContainer from '../../containers/AdListContainer';
import {
	APT_NAV_ITEMS,
	APT_NAV_ITEMS_INDEXES,
	APT_NAV_ITEMS_VALUES
} from '../../configs/commonConsts';

class Home extends Component {
	state = {
		redirectUrl: ''
	};

	getActiveTab = () => {
		const {
			customProps: { activeTab }
		} = this.props;

		return activeTab;
	};

	getSiteId = () => {
		const {
			match: {
				params: { siteId }
			}
		} = this.props;

		return siteId;
	};

	handleNavSelect = value => {
		const siteId = this.getSiteId();
		const computedRedirectUrl = `/sites/${siteId}/apps/ap-tag`;
		let redirectUrl = '';

		switch (Number(value)) {
			case 1:
				redirectUrl = `${computedRedirectUrl}`;
				break;

			case 2:
				redirectUrl = `${computedRedirectUrl}/manage`;
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
			case APT_NAV_ITEMS_INDEXES.CREATE_ADS:
				return <AdCodeGeneratorContainer {...this.props} />;
			case APT_NAV_ITEMS_INDEXES.MANAGE_ADS:
				return <AdListContainer {...this.props} />;
		}
	}

	render() {
		const { redirectUrl } = this.state;
		const activeTab = this.getActiveTab();
		const activeItem = APT_NAV_ITEMS[activeTab];

		if (redirectUrl) {
			return <Redirect to={{ pathname: redirectUrl }} />;
		}

		return (
			<div>
				<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>{APT_NAV_ITEMS_VALUES.CREATE_ADS}</NavItem>
					<NavItem eventKey={2}>{APT_NAV_ITEMS_VALUES.MANAGE_ADS}</NavItem>
				</Nav>
				{this.renderContent()}
			</div>
		);
	}
}

export default Home;
