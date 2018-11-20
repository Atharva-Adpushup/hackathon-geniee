import React, { Component } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import ActionCard from '../../../../Components/ActionCard.jsx';
import AdCodeGeneratorContainer from '../../containers/AdCodeGeneratorContainer';
import AdListContainer from '../../containers/AdListContainer';
import AdsTxtConfig from './AdsTxtConfig.jsx';
import InitCode from './InitCode.jsx';
import { COMPONENT_TITLES } from '../../configs/commonConsts';

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
		switch (this.state.activeNav) {
			case 1:
				return <AdCodeGeneratorContainer {...this.props} />;
			case 2:
				return <AdListContainer {...this.props} />;
			case 3:
				return <AdsTxtConfig {...this.props} />;
			case 4:
				return <InitCode {...this.props} />;
		}
	}

	render() {
		return (
			<ActionCard title={this.state.title}>
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
