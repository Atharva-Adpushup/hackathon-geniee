import React from 'react';
import { Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import CustomButton from '../../../Components/CustomButton';

class Setup extends React.Component {
	$window = window;

	componentDidMount() {
		const {
			setupStatus: { isAdpushupDfp, dfpConnected }
		} = this.props;

		if (!isAdpushupDfp && !dfpConnected) this.addPostMessageListener();
	}

	addPostMessageListener = () => {
		const { $window } = this;

		$window.addEventListener('message', this.handlePostMessageHandler.bind(this), false);
	};

	removePostMessageListener = () => {
		const { $window } = this;

		$window.removeEventListener('message', this.handlePostMessageHandler.bind(this), false);
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

	checkOrBeginDfpSetup = () => {
		const { siteId, checkOrBeginDfpSetupAction } = this.props;

		checkOrBeginDfpSetupAction(siteId);
	};

	// eslint-disable-next-line class-methods-use-this
	handlePostMessageHandler(event) {
		const isStringData = !!(typeof event.data === 'string');
		const parsedData = isStringData ? JSON.parse(event.data) : event.data;
		const isValidData = !!(
			Object.keys(parsedData).length === 2 &&
			parsedData.cmd &&
			parsedData.data &&
			Array.isArray(parsedData.data) &&
			parsedData.data.length
		);

		if (!isValidData) return false;

		const dfpNetwork = parsedData.data.find(network => network.networkName === 'DFP');
		const isDfpConnected = !!dfpNetwork && !!dfpNetwork.dfpAccounts.length;

		if (!isDfpConnected) return false;

		const { siteId, setDfpSetupStatusAction } = this.props;

		setDfpSetupStatusAction(siteId);

		return true;
	}

	renderMainContent = () => {
		const {
			setupStatus: {
				isAdpushupDfp,
				dfpConnected,
				adServerSetupCompleted,
				inventoryFound,
				biddersFound,
				adpushupNetworkCode
			}
		} = this.props;

		return (
			<Row className="options-wrapper white-tab-container hb-setup">
				<p>
					Want to get started with Header-bidding, please ensure the following before proceeding any
					further:
				</p>
				<ul className="text-points">
					{!isAdpushupDfp && (
						<React.Fragment>
							<li>Ad Manager is connected with AdPushup</li>
							<li>
								Line Items, Key Value Pairs, and AdX should be configured with your Ad Manager
							</li>
						</React.Fragment>
					)}
					<li>
						There is at least one ad unit created on the AdPushup Tags, or Layout Editor, or
						Innovative Ads
					</li>
					<li>There is atleast one bidder approved and integrated for your website</li>
				</ul>
				<ul className="u-padding-l0 u-margin-t5">
					<li>
						<span className="name">Ad Manager</span>
						{isAdpushupDfp && <span>AdPushup Inc ({adpushupNetworkCode})</span>}
						{!isAdpushupDfp && (
							<span className="status">
								{dfpConnected ? (
									<FontAwesomeIcon icon="check" title="Ad Manager is connected" />
								) : (
									<FontAwesomeIcon icon="info-circle" title="Ad Manager not connected!" />
								)}
							</span>
						)}
						{!isAdpushupDfp && !dfpConnected && (
							<span className="btn-wrap">
								<CustomButton
									variant="secondary"
									name="connectDfpBtn"
									onClick={this.openGoogleOauthWindow}
								>
									Connect
								</CustomButton>
							</span>
						)}
					</li>
					{!isAdpushupDfp && (
						<li>
							<span className="name">AdServer Setup</span>
							<span className="status">
								{adServerSetupCompleted ? (
									<FontAwesomeIcon icon="check" title="AdServer Setup is completed" />
								) : (
									<FontAwesomeIcon icon="info-circle" title="AdServer Setup is pending!" />
								)}
							</span>
							{!adServerSetupCompleted && (
								<span className="btn-wrap">
									<CustomButton
										variant="secondary"
										name="setupAdServer"
										onClick={this.checkOrBeginDfpSetup}
									>
										Setup
									</CustomButton>
								</span>
							)}
						</li>
					)}
					<li>
						<span className="name">Inventory</span>
						<span className="status">
							{inventoryFound ? (
								<FontAwesomeIcon icon="check" title="Inventory found" />
							) : (
								<FontAwesomeIcon icon="info-circle" title="Inventory not found!" />
							)}
						</span>
					</li>
					<li>
						<span className="name">Bidders</span>
						<span className="status">
							{biddersFound ? (
								<FontAwesomeIcon icon="check" title="Bidders found" />
							) : (
								<FontAwesomeIcon icon="info-circle" title="Bidders Not found!" />
							)}
						</span>
						{!biddersFound && (
							<span className="btn-wrap">
								<Link to="header-bidding/bidders">
									<CustomButton variant="secondary" name="addBidders">
										Add Bidders
									</CustomButton>
								</Link>
							</span>
						)}
					</li>
				</ul>
				{!isAdpushupDfp && (
					<p>Note: Ensure that Google AdX is connected and default for dynamic allocation.</p>
				)}
			</Row>
		);
	};

	render() {
		const { setupStatus } = this.props;
		return setupStatus && this.renderMainContent();
	}
}

export default Setup;
