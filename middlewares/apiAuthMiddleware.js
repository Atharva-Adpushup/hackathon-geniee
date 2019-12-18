const Promise = require('bluebird');

const authToken = require('../helpers/authToken');
const userModel = require('../models/userModel');

const openRoutes = ['/login', '/signup', '/forgotPassword', '/resetPassword', '/utils'];
const closedRoutes = ['/user'];

module.exports = (req, res, next) => {
	function isDifferentGenieeSiteId() {
		const url = req.url;
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
	const isSessionInvalid = !!(!req.session || !req.session.user);
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
	if (!userCookie) {
		res.clearCookie('user');
		return res.redirect('/login');
	}

	const token = JSON.parse(userCookie).authToken;

	return Promise.join(authToken.decodeAuthToken(token), decoded =>
		userModel.getUserByEmail(decoded.email).then(() => {
			req.user = decoded;
			next();
			return null;
		})
	).catch(err => {
		console.log(err);
		res.clearCookie('user');
		return res.redirect('/login');
	});
};
