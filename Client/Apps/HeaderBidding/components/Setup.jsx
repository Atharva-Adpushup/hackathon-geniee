import React from 'react';
import { Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomButton from '../../../Components/CustomButton';

class Setup extends React.Component {
	$window = window;

	componentDidMount() {
		this.addPostMessageListener();
	}

	addPostMessageListener = () => {
		const { $window } = this;

		$window.addEventListener('message', this.handlePostMessageHandler.bind(this), false);
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

		if (!isValidData) {
			return false;
		}

		// eslint-disable-next-line no-console
		console.log(parsedData.data);

		return true;
	}

	renderMainContent = () => {
		const {
			setupStatus: { dfpConnected, adServerSetupCompleted, inventoryFound, biddersFound }
		} = this.props;

		return (
			<Row className="options-wrapper hb-setup">
				<p>
					Lorem ipsum dolor sit amet, consectetur adipisicing elit. Numquam necessitatibus odit
					omnis laboriosam voluptatum incidunt quasi delectus, repudiandae, aspernatur, ullam rem
					culpa nihil quos aut optio beatae reprehenderit vitae iure.
				</p>
				<ul className="u-padding-l0 u-margin-t5">
					<li>
						<span className="name">Google Ad Manager</span>
						<span className="status">
							{dfpConnected ? (
								<FontAwesomeIcon icon="check" />
							) : (
								<FontAwesomeIcon icon="info-circle" title="Google DFP not connected!" />
							)}
						</span>
						{!dfpConnected && (
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
					<li>
						<span className="name">AdServer Setup</span>
						<span className="status">
							{adServerSetupCompleted ? (
								<FontAwesomeIcon icon="check" />
							) : (
								<FontAwesomeIcon icon="info-circle" title="AdServer Setup is pending!" />
							)}
						</span>
						{!adServerSetupCompleted && (
							<span className="btn-wrap">
								<CustomButton variant="secondary" name="setupAdServer">
									Setup
								</CustomButton>
							</span>
						)}
					</li>
					<li>
						<span className="name">Inventory</span>
						<span className="status">
							{inventoryFound ? (
								<FontAwesomeIcon icon="check" />
							) : (
								<FontAwesomeIcon icon="info-circle" title="Inventory not found!" />
							)}
						</span>
					</li>
					<li>
						<span className="name">Bidders</span>
						<span className="status">
							{biddersFound ? (
								<FontAwesomeIcon icon="check" />
							) : (
								<FontAwesomeIcon icon="info-circle" title="Bidders Not found!" />
							)}
						</span>
						{!biddersFound && (
							<span className="btn-wrap">
								<CustomButton
									variant="secondary"
									name="addBidders"
									onClick={this.openGoogleOauthWindow}
								>
									Add Bidders
								</CustomButton>
							</span>
						)}
					</li>
				</ul>
			</Row>
		);
	};

	render() {
		const { setupStatus } = this.props;
		return setupStatus && this.renderMainContent();
	}
}

export default Setup;
