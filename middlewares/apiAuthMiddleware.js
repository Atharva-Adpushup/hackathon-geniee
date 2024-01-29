const Promise = require('bluebird');
const authToken = require('../helpers/authToken');
const userModel = require('../models/userModel');
const shouldRespondWith401Status = require('./shouldRespondWith401Status');
const httpStatusConsts = require('../configs/httpStatusConsts');
const { HTTP_RESPONSE_MESSAGES } = require('../configs/commonConsts');

const openRoutes = [
	'/login',
	'/signup',
	'/forgotPassword',
	'/resetPassword',
	'/utils',
	'/getAccessToken'
];
const closedRoutes = ['/user'];

function handleUnauthorizedRequests(req, res) {
	res.clearCookie('user');
	if (shouldRespondWith401Status(req)) {
		return res
			.status(httpStatusConsts.UNAUTHORIZED)
			.json({ error: HTTP_RESPONSE_MESSAGES.UNAUTHORIZED_ACCESS });
	}

	return res.redirect('/login');
}

module.exports = (req, res, next) => {
	function isDifferentGenieeSiteId() {
		const { url } = req;
		const sessionSiteId = Number(req.session.siteId);
		const sitePath = '/user/site/';
		const siteIdPathRegex = /^\/user\/site\/(\d{1,10})\//;
		const isSitePathInUrl = url.indexOf(sitePath) > -1;
		const regexMatcher = siteIdPathRegex.exec(url);
		const isValidMatch = !!(
			isSitePathInUrl &&
			regexMatcher &&
			regexMatcher.constructor === Array &&
			regexMatcher.length &&
			regexMatcher.length === 2
		);
		const matchedSiteId = isValidMatch ? Number(regexMatcher[1]) : 0;
		const isTrue = !!(matchedSiteId && sessionSiteId !== matchedSiteId);
		return isTrue;
	}

	function isOpenRoute() {
		return !!openRoutes.find(route => {
			const re = new RegExp(route, 'g');
			return re.test(req.url) || false;
		});
	}

	function isAuthorised() {
		return !!closedRoutes.find(route => req.url.indexOf(route) !== -1);
	}

	const isSession = !!req.session;
	const isUserInSession = !!(isSession && req.session.user);
	const isSiteIdInSession = !!(isSession && req.session.siteId);
	const isAuthorisedURL = !!(isSession && isAuthorised());
	const isOpenRouteValid = isOpenRoute();
	const isDifferentGenieeSite = !!(
		isSession &&
		isUserInSession &&
		isSiteIdInSession &&
		isAuthorisedURL &&
		isDifferentGenieeSiteId()
	);

	if (isOpenRouteValid) {
		return next();
	}

	if (req.session && req.session.partner === 'geniee' && !isAuthorised()) {
		if (req.url.indexOf('.map') === -1) {
			req.session.destroy(() => res.redirect('/403'));
			return false;
		}
	} else if (isDifferentGenieeSite) {
		return res.redirect('/403');
	}
	const userCookie = req.cookies.user;
	const adpToken = req.headers.authorization;

	const token = (userCookie && JSON.parse(userCookie).authToken) || adpToken || null;

	if (!token) {
		return handleUnauthorizedRequests(req, res);
	}

	return Promise.join(authToken.decodeAuthToken(token), decoded => {
		if (decoded.isAdpUser) {
			req.user = decoded;
			return next();
		}

		return userModel.getUserByEmail(decoded.email).then(user => {
			if (decoded.originalEmail) {
				return userModel.getUserByEmail(decoded.originalEmail).then(originalUser => {
					if (decoded.loginTime < originalUser.get('passwordUpdatedOn') || !decoded.loginTime) {
						return handleUnauthorizedRequests(req, res);
					}
					req.user = decoded;
					next();
					return null;
				});
			}
			if (decoded.loginTime < user.get('passwordUpdatedOn') || !decoded.loginTime) {
				return handleUnauthorizedRequests(req, res);
			}
			req.user = decoded;
			next();
			return null;
		});
	}).catch(() => handleUnauthorizedRequests(req, res));
};
