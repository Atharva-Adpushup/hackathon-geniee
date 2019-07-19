import React, { Component } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInfoCircle, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ActionCard from '../../../../Components/ActionCard/index';
import OverlayTooltip from '../../../../Components/OverlayTooltip/index';
import ControlTagConversion from './ControlTagConversion';
import Loader from '../../../../Components/Loader';

library.add(faInfoCircle, faExternalLinkAlt);

class Home extends Component {
	constructor(props) {
		super(props);
		const defaultNavItem = 1;
		this.state = {
			activeNav: defaultNavItem
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

	getVisualEditorLink = siteId => `/api/visualEditor/${siteId}`;

	handleNavSelect(value) {
		this.setState({ activeNav: value });
	}

	renderContent() {
		const { activeNav } = this.state;
		const siteId = this.getSiteId();

		switch (activeNav) {
			default:
			case 1:
				return <ControlTagConversion siteId={siteId} />;
			case 2:
				return <Loader />;
		}
	}

	render() {
		const { activeNav } = this.state;
		const siteId = this.getSiteId();
		const computedEditorLink = this.getVisualEditorLink(siteId);

		return (
			<ActionCard>
				<Nav bsStyle="tabs" activeKey={activeNav} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>
						Transform Code
						<OverlayTooltip
							id="tooltip-info-transform-code"
							placement="top"
							tooltip="Wrap your existing ad codes with AdPushup code wrapper"
						>
							<FontAwesomeIcon icon="info-circle" className="u-margin-l3" />
						</OverlayTooltip>
					</NavItem>
					<NavItem eventKey={2} href={computedEditorLink}>
						Visual Editor
						<OverlayTooltip
							id="tooltip-info-visual-editor"
							placement="top"
							tooltip="To visit Visual Editor, please click here"
						>
							<FontAwesomeIcon icon="info-circle" className="u-margin-l3" />
						</OverlayTooltip>
					</NavItem>
				</Nav>
				{this.renderContent()}
			</ActionCard>
		);
	}
}

export default Home;
