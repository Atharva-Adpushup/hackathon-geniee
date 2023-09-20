import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCheckCircle } from '@/Client/helpers/fort-awesome-imports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ActionCard from '../../../Components/ActionCard/index';
import HeroFeature from '../../../Components/Layout/HeroFeature';
import CustomButton from '../../../Components/CustomButton/index';
import { INTG_NAV_ITEMS_INDEXES } from '../constants/index';
import userService from '../../../services/userService';

library.add(faCheckCircle);

class Integrations extends Component {
	// TODO: Identify how to successfully apply destructuring for below properties
	isGoogleOauthConnected =
		!!(
			this.props &&
			// eslint-disable-next-line react/destructuring-assignment
			this.props.user &&
			// eslint-disable-next-line react/destructuring-assignment
			this.props.user.adNetworkSettings &&
			// eslint-disable-next-line react/destructuring-assignment
			Array.isArray(this.props.user.adNetworkSettings) &&
			// eslint-disable-next-line react/destructuring-assignment
			this.props.user.adNetworkSettings.length
		) || false;

	state = {
		redirectUrl: '',
		isGoogleOauthConnected: this.isGoogleOauthConnected,
		isConnectViaSupportAccountLoading: false
	};

	$window = window;

	componentDidMount() {
		this.addPostMessageListener();
	}

	componentWillUnmount() {
		this.removePostMessageListener();
	}

	addPostMessageListener = () => {
		const { $window } = this;

		// TODO: Implement an elegant way to bind class object to its method than .bind(this)
		$window.addEventListener('message', this.handlePostMessageHandler.bind(this), false);
	};

	removePostMessageListener = () => {
		const { $window } = this;

		$window.removeEventListener('message', this.handlePostMessageHandler.bind(this), false);
	};

	getActiveTab = () => {
		const {
			customProps: { activeTab }
		} = this.props;

		return activeTab;
	};

	openGoogleOauthWindow = () => {
		const { $window } = this;
		const { screen } = $window;
		const x = screen.width / 2 - 700 / 2;
		const y = screen.height / 2 - 450 / 2;
		$window.open(
			'/api/user/requestGoogleOAuth',
			'Oauth Request',
			`height=485,width=700,left=${x},top=${y}`
		);
	};

	handleGoogleOauthSkipper = async () => {
		try {
			this.setState({ isConnectViaSupportAccountLoading: true });
			const { updateAdNetworkSettings } = this.props;
			const response = await userService.skipOauthInGoogleAccountIntegration();
			this.setState({ isGoogleOauthConnected: true }, () => updateAdNetworkSettings(response.data));
		} catch (error) {
			const { showNotification } = this.props;
			showNotification({
				mode: 'error',
				title: 'Connect via Support Account falied',
				message: 'Try updating the refresh token in config',
				autoDismiss: 5
			});
		} finally {
			this.setState({ isConnectViaSupportAccountLoading: false });
		}
	};

	handleGoogleAccountLinking = inputParam => {
		const { target } = inputParam;

		const { name } = target;

		switch (name) {
			case 'connectGoogleAccountButton':
				this.openGoogleOauthWindow();
				break;
			case 'connectViaSupportAccountButton':
				this.handleGoogleOauthSkipper();
				break;

			default:
				break;
		}
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

	handlePostMessageHandler(event) {
		const { updateAdNetworkSettings } = this.props;
		const isStringData = !!(typeof event.data === 'string');
		const parsedData = isStringData ? JSON.parse(event.data) : event.data;
		const isValidData = !!(
			Object.keys(parsedData).length === 2 &&
			parsedData.cmd &&
			parsedData.data &&
			Array.isArray(parsedData.data) &&
			parsedData.data.length
		);

		if (!isValidData) {
			return false;
		}

		this.setState({ isGoogleOauthConnected: true }, () => updateAdNetworkSettings(parsedData.data));
		return true;
	}

	renderAccountConnectedUI = () => (
		<React.Fragment>
			<FontAwesomeIcon size="5x" icon="check-circle" className="u-margin-b4" />
			<h3 className="u-text-bold">Your Google account is connected.</h3>
		</React.Fragment>
	);

	renderDefaultDescriptionUI = () => {
		const { user } = this.props;
		const { isSuperUser } = user;
		const { isConnectViaSupportAccountLoading } = this.state;
		return (
			<React.Fragment>
				<h3 className="u-margin-t3 u-margin-b4 u-text-bold">Connect your Google account</h3>
				<p className="u-margin-b4 text-center">
					Connecting your Google account with AdPushup helps us to access your inventory and reports
					for all Google services and manage them conveniently.
				</p>
				<CustomButton
					variant="primary"
					className=""
					name="connectGoogleAccountButton"
					onClick={this.handleGoogleAccountLinking}
				>
					Connect
				</CustomButton>
				{isSuperUser ? (
					<>
						<br />
						<CustomButton
							variant="primary"
							className=""
							name="connectViaSupportAccountButton"
							showSpinner={isConnectViaSupportAccountLoading}
							disabled={isConnectViaSupportAccountLoading}
							onClick={this.handleGoogleAccountLinking}
						>
							Connect via Support Account
						</CustomButton>
					</>
				) : null}
			</React.Fragment>
		);
	};

	renderContent = () => {
		const activeTab = this.getActiveTab();
		const { isGoogleOauthConnected } = this.state;
		const leftChildrenUI = isGoogleOauthConnected
			? this.renderAccountConnectedUI()
			: this.renderDefaultDescriptionUI();
		const computedRootClassName = isGoogleOauthConnected
			? 'u-padding-v5 u-padding-h4 u-bg-color-success'
			: 'u-padding-v5 u-padding-h4';
		const computedLeftChildrenClassName = isGoogleOauthConnected ? 'u-color-success' : '';

		switch (activeTab) {
			default:
			case INTG_NAV_ITEMS_INDEXES.CONNECT_GOOGLE:
				// TODO: Abstract out Google Account integration functionality into a separate component
				return (
					<HeroFeature
						rootClassName={computedRootClassName}
						leftChildrenClassName={computedLeftChildrenClassName}
						leftChildren={leftChildrenUI}
						imageUrl="/assets/images/onboarding/3.png"
						imageAlt="Connect Google Account"
					/>
				);
		}
	};

	render() {
		// const activeTab = this.getActiveTab();
		// const activeItem = INTG_NAV_ITEMS[activeTab];
		const { redirectUrl } = this.state;

		if (redirectUrl) {
			return <Redirect to={{ pathname: redirectUrl }} />;
		}

		return (
			<ActionCard>
				{/* <Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>{INTG_NAV_ITEMS_VALUES.CONNECT_GOOGLE}</NavItem>
				</Nav> */}
				{this.renderContent()}
			</ActionCard>
		);
	}
}

export default Integrations;
