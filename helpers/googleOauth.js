/**
 * Created by Dhiraj on 3/14/2016.
 */
var { google } = require('googleapis'),
	config = require('../configs/config'),
	userModel = require('../models/userModel'),
	AdPushupError = require('../helpers/AdPushupError'),
	OAuth2 = google.auth.OAuth2,
	Promise = require('bluebird'),
	oauth2Client = new OAuth2(
		config.googleOauth.OAUTH_CLIENT_ID,
		config.googleOauth.OAUTH_CLIENT_SECRET,
		config.googleOauth.OAUTH_CALLBACK
	);

// oauth2Client = Promise.promisifyAll(oauth2Client);

module.exports = {
	getClient: function(user, needAccountId) {
		var getNetworkData = user.getNetworkData('ADSENSE', true),
			setToken = getNetworkData.then(function(data) {
				if (!data) {
					throw new AdPushupError('Adsense account not linked');
				}
				if (user.get('isInMcm') && user.get('managedBy')) {
					return userModel.getUserByEmail(user.get('managedBy')).then(function(agencyUser) {
						return agencyUser.getNetworkData('ADSENSE', true).then(function(obj) {
							if (!obj) {
								throw new AdPushupError("Agency user doesn't have Adsense account linked.");
							}
							oauth2Client.setCredentials({
								access_token: obj.accessToken,
								refresh_token: obj.refreshToken
							});
							// @Todo need to save token in user object so that we don't have to refresh token every time
							return oauth2Client;
						});
					});
				}
				oauth2Client.setCredentials({
					access_token: data.accessToken,
					refresh_token: data.refreshToken
				});
				// @Todo need to save token in user object so that we don't have to refresh token every time
				return oauth2Client;
			}),
			refreshToken = setToken.then(function(oauth2UpdatedClient) {
				return oauth2UpdatedClient.refreshAccessTokenAsync();
			});

		return Promise.join(getNetworkData, setToken, refreshToken, function(
			networkData,
			client,
			newCreds
		) {
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
	getRedirectUrl: function(state) {
		return oauth2Client.generateAuthUrl({
			access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
			scope: config.googleOauth.OAUTH_SCOPE, // If you only need one scope you can pass it as string
			// eslint-disable-next-line new-undef
			client_id: config.googleOauth.OAUTH_CLIENT_ID,
			approval_prompt: 'force',
			state: state // unique long string
		});
	},
	getAccessTokens: function(code) {
		return oauth2Client.getTokenAsync(code);
	}
};
