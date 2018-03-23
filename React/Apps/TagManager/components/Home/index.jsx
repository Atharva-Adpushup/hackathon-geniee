import React, { Component } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import ActionCard from '../../../../Components/ActionCard.jsx';
import AdCodeGenerator from './AdCodeGenerator.jsx';

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeNav: 1,
			progress: 0
		};
		this.handleNavSelect = this.handleNavSelect.bind(this);
		this.renderContent = this.renderContent.bind(this);
	}

	handleNavSelect(value) {
		this.setState({ activeNav: value });
	}

	renderContent() {
		switch (this.state.activeNav) {
			case 1:
				return <AdCodeGenerator />;
			// case 2:
			// 	return <OpsPanel />;
			// case 3:
			// 	return <SiteMetricChartPanels />;
		}
	}

	render() {
		return (
			<ActionCard title="Tag Manager">
				<Nav bsStyle="tabs" activeKey={this.state.activeNav} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>Ad code Generator</NavItem>
					<NavItem eventKey={2}>List Ads</NavItem>
				</Nav>
				{this.renderContent()}
			</ActionCard>
		);
	}
}

export default Home;
