import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Nav, NavItem } from 'react-bootstrap';

import { getActiveChannel } from 'selectors/channelSelectors';
import { createSection } from 'actions/sectionActions';
import { showNotification } from 'actions/uiActions';
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
		this.adpushupSubmitHandler = this.adpushupSubmitHandler.bind(this);
	}

	handleNavSelect(value) {
		this.setState({ activeNav: value });
	}

	adpushupSubmitHandler(sectionPayload, adPayload) {
		const { variation, channel } = this.props;

		this.props.createSectionAndAd(
			{
				...sectionPayload,
				namingData: {
					platform: channel.platform,
					pagegroup: channel.pageGroup,
					service: 'I',
					height: adPayload.height,
					width: adPayload.width
				}
			},
			adPayload,
			variation.id
		);
		this.props.showNotification({
			mode: 'success',
			title: 'Operation Successful',
			message: 'AdPushup Interactive Ad Created'
		});
	}

	renderContent() {
		switch (this.state.activeNav) {
			case 1:
				return (
					<AdPushupAds {...this.props} submitHandler={this.adpushupSubmitHandler} showNetworkOptions={true} />
				);
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
	(state, ownProps) => {
		const channel = state.channelData.activeChannel ? getActiveChannel(state) : { platform: null, pageGroup: null };
		return { networkConfig: state.networkConfig, channel, ...ownProps };
	},
	dispatch =>
		bindActionCreators(
			{
				showNotification: showNotification,
				createSectionAndAd: createSection
			},
			dispatch
		)
)(InteractiveAds);
