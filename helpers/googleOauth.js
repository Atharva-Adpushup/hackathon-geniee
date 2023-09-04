/**
 * Created by Dhiraj on 3/14/2016.
 */
const { google } = require('googleapis');
const Promise = require('bluebird');
const config = require('../configs/config');
const userModel = require('../models/userModel');
const AdPushupError = require('../helpers/AdPushupError');

const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(
	config.googleOauth.OAUTH_CLIENT_ID,
	config.googleOauth.OAUTH_CLIENT_SECRET,
	config.googleOauth.OAUTH_CALLBACK
);

// oauth2Client = Promise.promisifyAll(oauth2Client);

module.exports = {
	getClient(user, needAccountId) {
		const getNetworkData = user.getNetworkData('ADSENSE', true);
		const setToken = getNetworkData.then(data => {
			if (!data) {
				throw new AdPushupError('Adsense account not linked');
			}
			if (user.get('isInMcm') && user.get('managedBy')) {
				return userModel.getUserByEmail(user.get('managedBy')).then(agencyUser =>
					agencyUser.getNetworkData('ADSENSE', true).then(agencyUserNetworkData => {
						if (!agencyUserNetworkData) {
							throw new AdPushupError("Agency user doesn't have Adsense account linked.");
						}
						oauth2Client.setCredentials({
							access_token: agencyUserNetworkData.accessToken,
							refresh_token: agencyUserNetworkData.refreshToken
						});
						// @Todo need to save token in user object so that we don't have to refresh token every time
						return oauth2Client;
					})
				);
			}
			oauth2Client.setCredentials({
				access_token: data.accessToken,
				refresh_token: data.refreshToken
			});
			// @Todo need to save token in user object so that we don't have to refresh token every time
			return oauth2Client;
		});
		const refreshToken = setToken.then(oauth2UpdatedClient =>
			oauth2UpdatedClient.refreshAccessTokenAsync()
		);

		return Promise.join(getNetworkData, setToken, refreshToken, (networkData, client, newCreds) => {
			oauth2Client.setCredentials(newCreds);
			if (needAccountId) {
				return [
					oauth2Client,
					networkData.pubId ? networkData.pubId : networkData.adsenseAccounts[0].id
				];
			}
			return oauth2Client;
		});
	},
	getRedirectUrl(state) {
		return oauth2Client.generateAuthUrl({
			access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
			scope: config.googleOauth.OAUTH_SCOPE, // If you only need one scope you can pass it as string
			// eslint-disable-next-line new-undef
			client_id: config.googleOauth.OAUTH_CLIENT_ID,
			prompt: 'consent',
			state // unique long string
		});
	},
	getAccessTokens(code) {
		return oauth2Client.getToken(code);
	},
	getAccessTokensFromRefreshToken(refreshToken) {
		oauth2Client.setCredentials({
			refresh_token: refreshToken
		});
		return oauth2Client.refreshAccessTokenAsync();
	}
};
