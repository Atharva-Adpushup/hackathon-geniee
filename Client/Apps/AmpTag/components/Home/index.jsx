import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Nav, NavItem } from '@/Client/helpers/react-bootstrap-imports';

import CustomError from '../../../../Components/CustomError/index';
import AdCodeGeneratorContainer from '../../containers/AdCodeGeneratorContainer';
import AdListContainer from '../../containers/AdListContainer';
import {
	AMP_NAV_ITEMS,
	AMP_NAV_ITEMS_INDEXES,
	AMP_NAV_ITEMS_VALUES
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
		const computedRedirectUrl = `/sites/${siteId}/apps/amp`;
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
		const { user: { adServerSettings: { dfp = null } = {} } = {} } = this.props;
		if (!dfp || !dfp.activeDFPNetwork)
			return (
				<CustomError message="To use this app, please select Google Account Manager. Contact AdPushup Ops for the same." />
			);
		switch (activeTab) {
			default:
			case AMP_NAV_ITEMS_INDEXES.CREATE_ADS:
				return <AdCodeGeneratorContainer {...this.props} />;
			case AMP_NAV_ITEMS_INDEXES.MANAGE_ADS:
				return <AdListContainer {...this.props} />;
		}
	}
	render() {
		const { redirectUrl } = this.state;
		const activeTab = this.getActiveTab();
		const activeItem = AMP_NAV_ITEMS[activeTab];
		if (redirectUrl) {
			return <Redirect to={{ pathname: redirectUrl }} />;
		}
		return (
			<div>
				<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>{AMP_NAV_ITEMS_VALUES.CREATE_TAG}</NavItem>
					<NavItem eventKey={2}>{AMP_NAV_ITEMS_VALUES.MANAGE_TAG}</NavItem>
				</Nav>
				{this.renderContent()}
			</div>
		);
	}
}

export default Home;
