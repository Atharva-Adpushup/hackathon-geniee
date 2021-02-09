import React from 'react';
import Mixpanel from 'mixpanel';

import authService from '../../services/authService';
import config from '../../config/config';

class MixPanelAnalytics extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		const token = config.MIXPANEL && config.MIXPANEL.TOKEN;
		if (!token) {
			return;
		}
		this.mixpanel = Mixpanel.init(token);
	}

	componentDidMount() {
		if (process.env.NODE_ENV !== 'production' || !this.mixpanel) {
			return;
		}

		const { user, name: componentName } = this.props;
		const { firstName, lastName } = user;

		const { email, originalEmail, isSuperUser } = authService.getTokenPayloadWithoutVerification();
		const loggedInEmail = originalEmail || email;

		if (!originalEmail) {
			this.mixpanel.people.set(loggedInEmail, {
				$first_name: firstName,
				$last_name: lastName,
				$email: loggedInEmail,
				adminUser: isSuperUser
			});
		}

		// this.mixpanel.track(componentName, {
		// 	distinct_id: loggedInEmail,
		// 	$email: loggedInEmail,
		// 	date: new Date().getTime()
		// });
	}

	componentWillUnmount() {
		const { name: componentName } = this.props;
		console.log(componentName, ' is unmounting');
	}

	render() {
		return <></>;
	}
}
export default MixPanelAnalytics;
