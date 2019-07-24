import React from 'react';
import { Redirect } from 'react-router-dom';
import { Nav, NavItem } from 'react-bootstrap';
// import ActionCard from '../../../Components/ActionCard/index';
import ManageAppsContainer from '../containers/ManageAppsContainer';
import { NAV_ITEMS, NAV_ITEMS_INDEXES, NAV_ITEMS_VALUES } from '../constants/index';
import SiteSettings from '../../SiteSettings/index';
import QuickSnapshotContainer from '../containers/QuickSnapshotContainer';

class ManageSite extends React.Component {
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
		const computedRedirectUrl = `/sites/${siteId}`;
		let redirectUrl = '';

		switch (Number(value)) {
			case 1:
				redirectUrl = `${computedRedirectUrl}`;
				break;

			case 2:
				redirectUrl = `${computedRedirectUrl}/settings`;
				break;

			case 3:
				redirectUrl = `${computedRedirectUrl}/apps`;
				break;

			default:
				break;
		}

		this.setState({ redirectUrl });
	};

	renderContent() {
		const activeTab = this.getActiveTab();
		const siteId = this.getSiteId();
		switch (activeTab) {
			default:
			case NAV_ITEMS_INDEXES.QUICK_SNAPSHOT:
				return <QuickSnapshotContainer siteId={siteId} />;
			case NAV_ITEMS_INDEXES.SITE_SETTINGS:
				return <SiteSettings {...this.props} />;
			case NAV_ITEMS_INDEXES.MANAGE_APPS:
				return <ManageAppsContainer {...this.props} />;
		}
	}

	render() {
		const activeTab = this.getActiveTab();
		const activeItem = NAV_ITEMS[activeTab];
		const { redirectUrl } = this.state;
		const { user } = this.props;

		if (redirectUrl) {
			return <Redirect to={{ pathname: redirectUrl }} />;
		}

		return (
			<div>
				<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>{NAV_ITEMS_VALUES.QUICK_SNAPSHOT}</NavItem>
					<NavItem eventKey={2}>{NAV_ITEMS_VALUES.SITE_SETTINGS}</NavItem>
					{user.isSuperUser && <NavItem eventKey={3}>{NAV_ITEMS_VALUES.MANAGE_APPS}</NavItem>}
				</Nav>
				{this.renderContent()}
			</div>
		);
	}
}

export default ManageSite;
