import React, { Component } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import ActionCard from '../../../../Components/ActionCard/index';
import AdCodeGeneratorContainer from '../../containers/AdCodeGeneratorContainer';
import AdListContainer from '../../containers/AdListContainer';
// import AdsTxtConfig from './AdsTxtConfig';
// import InitCode from './InitCode';
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
		const { activeNav } = this.state;
		switch (activeNav) {
			default:
			case 1:
				return <AdCodeGeneratorContainer {...this.props} />;
			case 2:
				return <AdListContainer {...this.props} />;
			// case 1:
			// 	return <InitCode {...this.props} />;
			// case 4:
			// 	return <AdsTxtConfig {...this.props} />;
		}
	}

	render() {
		const { title, activeNav } = this.state;
		return (
			<ActionCard title={title}>
				<Nav bsStyle="tabs" activeKey={activeNav} onSelect={this.handleNavSelect}>
					{/* <NavItem eventKey={1}>AdPushup Header Code</NavItem> */}
					<NavItem eventKey={1}>Ad code Generator</NavItem>
					<NavItem eventKey={2}>Ads List</NavItem>
					{/* <NavItem eventKey={4}>Ads.txt Config</NavItem> */}
				</Nav>
				{this.renderContent()}
			</ActionCard>
		);
	}
}

export default Home;
