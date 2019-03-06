import React from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import ActionCard from '../../../Components/ActionCard/index';
import ManageAppsContainer from '../containers/ManageAppsContainer';
import { DEFAULT_NAV_ITEM, TITLES } from '../constants/index';
import SiteSettings from '../../SiteSettings/index';

class ManageSite extends React.Component {
	state = {
		activeNav: DEFAULT_NAV_ITEM,
		title: TITLES[DEFAULT_NAV_ITEM]
	};

	handleNavSelect = value => {
		this.setState({ activeNav: value, title: TITLES[value] });
	};

	renderContent() {
		const { activeNav } = this.state;
		switch (activeNav) {
			default:
			case 1:
				return <div className="u-padding-v5 u-padding-h5">Quick Snap hoga yahan</div>;
			case 2:
				return <SiteSettings {...this.props} />;
			case 3:
				return <ManageAppsContainer {...this.props} />;
		}
	}

	render() {
		const { activeNav, title } = this.state;
		return (
			<ActionCard title={title}>
				<Nav bsStyle="tabs" activeKey={activeNav} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>Quick Snapshot</NavItem>
					<NavItem eventKey={2}>Site Settings</NavItem>
					<NavItem eventKey={3}>Manage Apps</NavItem>
				</Nav>
				{this.renderContent()}
			</ActionCard>
		);
	}
}

export default ManageSite;
