import React, { Component } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import ActionCard from '../../../../Components/ActionCard/index';
import ControlTagConversion from './ControlTagConversion';
import { COMPONENT_TITLES } from '../../constants/index';

class Home extends Component {
	constructor(props) {
		super(props);
		const defaultNavItem = 1;
		this.state = {
			activeNav: defaultNavItem,
			title: COMPONENT_TITLES[defaultNavItem]
		};
		this.handleNavSelect = this.handleNavSelect.bind(this);
		this.renderContent = this.renderContent.bind(this);
	}

	handleNavSelect(value) {
		this.setState({ activeNav: value, title: COMPONENT_TITLES[value] });
	}

	renderContent() {
		const { activeNav } = this.state;
		switch (activeNav) {
			default:
			case 1:
				return <ControlTagConversion />;
			case 2:
				return <div>Ad Layout component</div>;
		}
	}

	render() {
		const { title, activeNav } = this.state;
		return (
			<ActionCard title={title}>
				<Nav bsStyle="tabs" activeKey={activeNav} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>Control Code Conversion</NavItem>
					<NavItem eventKey={2}>Visit Visual Editor</NavItem>
				</Nav>
				{this.renderContent()}
			</ActionCard>
		);
	}
}

export default Home;
