import React, { Component } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInfoCircle, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ActionCard from '../../../../Components/ActionCard/index';
import OverlayTooltip from '../../../../Components/OverlayTooltip/index';
import ControlTagConversion from './ControlTagConversion';
import { COMPONENT_TITLES } from '../../constants/index';

library.add(faInfoCircle, faExternalLinkAlt);

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

	getSiteId = () => {
		const {
			match: {
				params: { siteId }
			}
		} = this.props;

		return siteId;
	};

	handleNavSelect(value) {
		this.setState({ activeNav: value, title: COMPONENT_TITLES[value] });
	}

	renderContent() {
		const { activeNav } = this.state;
		const siteId = this.getSiteId();

		switch (activeNav) {
			default:
			case 1:
				return <ControlTagConversion siteId={siteId} />;
			case 2:
				return <div>Ad Layout component</div>;
		}
	}

	render() {
		const { title, activeNav } = this.state;
		const siteId = this.getSiteId();
		const computedEditorLink = `/user/site/${siteId}/editor`;

		return (
			<ActionCard title={title}>
				<Nav bsStyle="tabs" activeKey={activeNav} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>
						Transform Code
						<OverlayTooltip
							id="tooltip-info"
							placement="top"
							tooltip="Wrap your existing ad codes with AdPushup code wrapper"
						>
							<FontAwesomeIcon icon="info-circle" className="u-margin-l3" />
						</OverlayTooltip>
					</NavItem>
				</Nav>
				{this.renderContent()}
				<h4 className="u-padding-h4 u-margin-t3 u-margin-b4 u-text-bold">
					To visit Visual Editor, please click here
					<a target="_blank" rel="noopener noreferrer" href={computedEditorLink}>
						<FontAwesomeIcon icon="external-link-alt" className="u-margin-l2" />
					</a>
				</h4>
			</ActionCard>
		);
	}
}

export default Home;
