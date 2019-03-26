import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Nav, NavItem } from 'react-bootstrap';
import ActionCard from '../../../Components/ActionCard/index';
import HeroFeature from '../../../Components/Layout/HeroFeature';
import CustomButton from '../../../Components/CustomButton/index';
import { INTG_NAV_ITEMS, INTG_NAV_ITEMS_INDEXES, INTG_NAV_ITEMS_VALUES } from '../constants/index';

class Integrations extends Component {
	state = {
		redirectUrl: ''
	};

	getActiveTab = () => {
		const {
			customProps: { activeTab }
		} = this.props;

		return activeTab;
	};

	handleNavSelect = value => {
		const computedRedirectUrl = '/integrations/';
		let redirectUrl = '';

		switch (Number(value)) {
			case 1:
				redirectUrl = `${computedRedirectUrl}${INTG_NAV_ITEMS_INDEXES.CONNECT_GOOGLE}`;
				break;

			default:
				break;
		}

		this.setState({ redirectUrl });
	};

	renderContent = () => {
		const activeTab = this.getActiveTab();

		switch (activeTab) {
			default:
			case INTG_NAV_ITEMS_INDEXES.CONNECT_GOOGLE:
				// return <div className="u-padding-v5 u-padding-h5">Integrations will be done here</div>;
				return (
					<HeroFeature
						rootClassName="u-padding-v5 u-padding-h4"
						leftChildren={
							<React.Fragment>
								<h3 className="u-margin-t3 u-margin-b4 u-text-bold">Connect your Google account</h3>
								<p className="u-margin-b4 text-center">
									Connecting your Google account with AdPushup helps us to access your inventory and
									reports for all Google services and manage them conveniently.
								</p>
								<CustomButton
									variant="primary"
									className=""
									name="connectGoogleAccountButton"
									onClick={() => {}}
								>
									Get Started
								</CustomButton>
							</React.Fragment>
						}
						imageUrl="/assets/images/onboarding/3.png"
						imageAlt="Connect Google Account"
					/>
				);
		}
	};

	render() {
		const activeTab = this.getActiveTab();
		const activeItem = INTG_NAV_ITEMS[activeTab];
		const { redirectUrl } = this.state;

		if (redirectUrl) {
			return <Redirect to={{ pathname: redirectUrl }} />;
		}

		return (
			<ActionCard>
				<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>{INTG_NAV_ITEMS_VALUES.CONNECT_GOOGLE}</NavItem>
				</Nav>
				{this.renderContent()}
			</ActionCard>
		);
	}
}

export default Integrations;
