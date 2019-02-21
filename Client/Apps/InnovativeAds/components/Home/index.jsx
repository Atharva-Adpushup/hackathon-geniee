import React, { Component } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import ActionCard from '../../../../Components/ActionCard';
import AdCodeGeneratorContainer from '../../containers/AdCodeGeneratorContainer';
import Loader from '../../../../Components/Loader';
import AdListContainer from '../../containers/AdListContainer';
import { COMPONENT_TITLES } from '../../configs/commonConsts';

class Home extends Component {
	constructor(props) {
		super(props);
		const defaultNavItem = 2;
		this.state = {
			activeNav: defaultNavItem,
			title: COMPONENT_TITLES[defaultNavItem]
		};
		this.handleNavSelect = this.handleNavSelect.bind(this);
		this.renderContent = this.renderContent.bind(this);
	}

	componentDidMount() {
		const { meta, fetchMeta, match } = this.props;
		if (!meta.fetched) fetchMeta(match.params.siteId);
	}

	handleNavSelect(value) {
		this.setState({ activeNav: value, title: COMPONENT_TITLES[value] });
	}

	renderContent() {
		const { activeNav } = this.state;
		switch (activeNav) {
			default:
			case 2:
				return <AdCodeGeneratorContainer {...this.props} />;
			case 3:
				return <AdListContainer {...this.props} />;
		}
	}

	render() {
		const { title, activeNav } = this.state;
		const { meta } = this.props;
		return (
			<ActionCard title={title}>
				{!meta.fetched ? (
					<div style={{ position: 'relative', minHeight: '200px' }}>
						<Loader />
					</div>
				) : (
					<React.Fragment>
						<Nav bsStyle="tabs" activeKey={activeNav} onSelect={this.handleNavSelect}>
							<NavItem eventKey={2}>Create Ads</NavItem>
							<NavItem eventKey={3}>Manage Ads</NavItem>
						</Nav>
						{this.renderContent()}
					</React.Fragment>
				)}
			</ActionCard>
		);
	}
}

export default Home;
