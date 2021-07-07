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

		const {
			user,
			name: componentName,
			location: { pathname: pagePath }
		} = this.props;
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

		const trackingObject = {
			distinct_id: loggedInEmail,
			$email: loggedInEmail,
			date: new Date().getTime(),
			userEmail: email,
			page: pagePath
		};

		this.mixpanel.track(componentName, trackingObject);
	}

	render() {
		return <></>;
	}
}
export default MixPanelAnalytics;
