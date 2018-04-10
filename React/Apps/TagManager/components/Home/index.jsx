import React, { Component } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import ActionCard from '../../../../Components/ActionCard.jsx';
import AdCodeGenerator from './AdCodeGenerator.jsx';
import AdList from './AdList/index.jsx';
import AdsTxtConfig from './AdsTxtConfig.jsx';
import InitCode from './InitCode.jsx';
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
				return <AdCodeGenerator {...this.props} />;
			case 2:
				return <AdList {...this.props} />;
			case 3:
				return <AdsTxtConfig {...this.props} />;
			case 4:
				return <InitCode {...this.props} />;
		}
	}

	render() {
		return (
			<ActionCard title="Create Ad Unit">
				<Nav bsStyle="tabs" activeKey={this.state.activeNav} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>Ad code Generator</NavItem>
					<NavItem eventKey={2}>List Ads</NavItem>
					<NavItem eventKey={3}>Ads.txt Config</NavItem>
					<NavItem eventKey={4}>View AdPushup Header Code</NavItem>
				</Nav>
				{this.renderContent()}
			</ActionCard>
		);
	}
}

export default Home;
