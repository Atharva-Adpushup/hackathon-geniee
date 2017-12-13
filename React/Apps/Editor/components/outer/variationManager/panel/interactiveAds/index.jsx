import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Nav, NavItem } from 'react-bootstrap';
import { showNotification } from 'actions/uiActions';
import { saveKeyValues } from 'actions/variationActions.js';
import { interactiveAds } from '../../../../../consts/commonConsts';
import AdPushupAds from './adpushupAds';
class InteractiveAds extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeNav: 1
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
				return <AdPushupAds {...this.props} />;
				break;
			case 2:
				return <div>Empty for now</div>;
		}
	}

	render() {
		return (
			<div className="interactive-ads">
				<Nav bsStyle="tabs" activeKey={this.state.activeNav} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>AdPushup</NavItem>
					<NavItem eventKey={2}>Others</NavItem>
				</Nav>
				{this.renderContent()}
			</div>
		);
	}
}

export default connect(
	(state, ownProps) => ({ ...ownProps }),
	dispatch =>
		bindActionCreators(
			{
				showNotification: showNotification,
				saveKeyValues: saveKeyValues
			},
			dispatch
		)
)(InteractiveAds);
