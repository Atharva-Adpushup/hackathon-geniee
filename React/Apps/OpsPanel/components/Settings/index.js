import React, { Component } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import ActionCard from '../../../../Components/ActionCard.jsx';
import OpsPanel from '../OpsPanel.jsx';
import General from './General';

class Settings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			site: this.props.match.params.siteId,
			activeNav: 1
		};
		this.handleNavSelect = this.handleNavSelect.bind(this);
		this.renderContent = this.renderContent.bind(this);
	}

	handleNavSelect(value) {
		this.setState({ activeNav: value });
	}

	renderContent() {
		window.siteId = this.state.site;
		switch (this.state.activeNav) {
			case 1:
				return <General siteId={this.state.site} rs={this.props.location.state.rs} />;
				break;
			case 2:
				return <OpsPanel />;
		}
	}

	render() {
		return (
			<ActionCard title="Settings">
				<Nav bsStyle="tabs" activeKey={this.state.activeNav} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>General</NavItem>
					<NavItem eventKey={2}>HB Config</NavItem>
				</Nav>
				{this.renderContent()}
			</ActionCard>
		);
	}
}

export default Settings;
