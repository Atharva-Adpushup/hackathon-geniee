import Mixpanel from 'mixpanel';

import authService from '../services/authService';
import config from '../config/config';

const token = config.MIXPANEL && config.MIXPANEL.TOKEN;
const mixpanel = token ? Mixpanel.init(token) : null;
const mixpanelEvents = {
	trackEvent: (eventName, properties) => {
		if (process.env.NODE_ENV !== 'production' || !mixpanel) {
			return;
		}
		const { email, originalEmail } = authService.getTokenPayloadWithoutVerification();
		const loggedInEmail = originalEmail || email;
		const trackingObject = {
			...properties,
			distinct_id: loggedInEmail
		};
		if (eventName === 'Reports') {
			trackingObject.reportingForAccount = email;
		}
		mixpanel.track(eventName, trackingObject);
	}
};

export default mixpanelEvents;
