import React from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import ActionCard from '../../../Components/ActionCard/index';
import ManageAppsContainer from '../containers/ManageAppsContainer';
import { NAV_ITEMS, NAV_ITEMS_INDEXES, NAV_ITEMS_VALUES } from '../constants/index';
import SiteSettings from '../../SiteSettings/index';

class ManageSite extends React.Component {
	getActiveTab = () => {
		const {
			customProps: { activeTab }
		} = this.props;

		return activeTab;
	};

	renderContent() {
		const activeTab = this.getActiveTab();

		switch (activeTab) {
			default:
			case NAV_ITEMS_INDEXES.QUICK_SNAPSHOT:
				return <div className="u-padding-v5 u-padding-h5">Quick Snap hoga yahan</div>;
			case NAV_ITEMS_INDEXES.SITE_SETTINGS:
				return <SiteSettings {...this.props} />;
			case NAV_ITEMS_INDEXES.MANAGE_APPS:
				return <ManageAppsContainer {...this.props} />;
		}
	}

	render() {
		const activeTab = this.getActiveTab();
		const activeItem = NAV_ITEMS[activeTab];

		return (
			<ActionCard>
				<Nav bsStyle="tabs" activeKey={activeItem.INDEX}>
					<NavItem eventKey={1}>{NAV_ITEMS_VALUES.QUICK_SNAPSHOT}</NavItem>
					<NavItem eventKey={2}>{NAV_ITEMS_VALUES.SITE_SETTINGS}</NavItem>
					<NavItem eventKey={3}>{NAV_ITEMS_VALUES.MANAGE_APPS}</NavItem>
				</Nav>
				{this.renderContent()}
			</ActionCard>
		);
	}
}

export default ManageSite;
