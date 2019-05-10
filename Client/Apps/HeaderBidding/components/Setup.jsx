import React from 'react';
import { Row } from 'react-bootstrap';
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

	renderMainContent = () => (
		<Row className="options-wrapper">
			<p>
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. Numquam necessitatibus odit omnis
				laboriosam voluptatum incidunt quasi delectus, repudiandae, aspernatur, ullam rem culpa
				nihil quos aut optio beatae reprehenderit vitae iure.
			</p>

			<CustomButton variant="primary" name="connectDfpBtn" onClick={this.openGoogleOauthWindow}>
				Connect
			</CustomButton>
		</Row>
	);

	render() {
		return this.renderMainContent();
	}
}

export default Setup;
