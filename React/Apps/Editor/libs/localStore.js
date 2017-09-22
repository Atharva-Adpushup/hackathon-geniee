import $ from 'jquery';
import _ from 'lodash';

const Utils = require('./utils');

let enums = {
	ADP_SERVER_JSON: 'ADP_SERVER_JSON',
	ADP_LOADED_JSON: 'ADP_LOADED_JSON'
};

let getJsonFromKey = function(key) {
	return JSON.parse(localStorage.getItem(key));
};

let cleanJson = function(json) {
	return (json = JSON.parse(JSON.stringify(json))); // To make sure that every toJSON method is called on json object this will ensure that we have json of every thing
};

let save = function(key, json) {
	let dfd = $.Deferred();
	setTimeout(() => {
		localStorage.setItem(key, JSON.stringify(json));
		!areObjectsChanged(json, getJsonFromKey(key)) ? dfd.resolve() : dfd.reject();
	}, 0);
	return dfd.promise();
};

let saveServerData = function(json) {
	return save(enums.ADP_SERVER_JSON, json);
};

let saveLoadedData = function(json) {
	return save(enums.ADP_LOADED_JSON, json);
};

let saveLoadedChannel = function(channelJSON) {
	let json = getJsonFromKey(enums.ADP_LOADED_JSON),
		channelIndex = _.indexOf(_.pluck(json ? json.channels : [], 'id'), channelJSON.id);
	if (channelIndex == -1) {
		json.channels.push(channelJSON);
	} else {
		json.channels[channelIndex] = channelJSON;
	}
	return save(enums.ADP_LOADED_JSON, json);
};

let loadServerChannel = function(id) {
	let json = getJsonFromKey(enums.ADP_SERVER_JSON);
	if (!json || !json.channels) {
		return false;
	}

	let channel = _(json.channels).findWhere({ id }) || false;
	return channel;
};

let loadChannel = function(id) {
	let json = getJsonFromKey(enums.ADP_LOADED_JSON);
	if (!json.channels) {
		return false;
	}

	return _(json.channels).findWhere({ id }) || false;
};

let areObjectsChanged = function(obj1, obj2) {
	obj1 = cleanJson(obj1);
	obj2 = cleanJson(obj2);
	return Utils.deepDiffMapper.test(obj1, obj2).isChanged;
};

let isChannelChanged = function(channelJson) {
	let localChannel = loadChannel(channelJson.id);
	if (!localChannel) {
		return true;
	}
	return areObjectsChanged(channelJson, localChannel);
};

let loadSiteData = function() {
	return getJsonFromKey(enums.ADP_LOADED_JSON);
};

let isSiteChanged = function(siteJson) {
	let localJson = loadSiteData();
	if (!localJson) {
		return true;
	}
	return areObjectsChanged(siteJson, localJson);
};

let deleteChannel = function(channelId) {
	let json = getJsonFromKey(enums.ADP_LOADED_JSON);
	if (!json.channels) {
		return true;
	}

	json.channels = _(json.channels).reject({ id: channelId });
	save(enums.ADP_LOADED_JSON, json);
	return true;
};

export default {
	saveServerData,
	saveLoadedData,
	saveLoadedChannel,
	loadChannel,
	loadServerChannel,
	loadSiteData,
	isSiteChanged,
	isChannelChanged,
	deleteChannel
};
