import $ from 'jquery';
import _ from 'underscore';

const Utils = require('./utils');

var enums = {
	ADP_SERVER_JSON: 'ADP_SERVER_JSON',
	ADP_LOADED_JSON: 'ADP_LOADED_JSON'
};

var getJsonFromKey = function (key) {
	return JSON.parse(localStorage.getItem(key));
};

var cleanJson = function (json) {
	return json = JSON.parse(JSON.stringify(json)); // To make sure that every toJSON method is called on json object this will ensure that we have json of every thing
};

var save = function (key, json) {
	var dfd = $.Deferred();
	setTimeout(function () {
		localStorage.setItem(key, JSON.stringify(json));
		!areObjectsChanged(json, getJsonFromKey(key)) ? dfd.resolve() : dfd.reject();
	}, 0);
	return dfd.promise();
};

var saveServerData = function (json) {
	return save(enums.ADP_SERVER_JSON, json);
};

var saveLoadedData = function (json) {
	return save(enums.ADP_LOADED_JSON, json);
};

var saveLoadedChannel = function (channelJSON) {
	var json = getJsonFromKey(enums.ADP_LOADED_JSON),
		channelIndex = _.indexOf(_.pluck(json ? json.channels : [], 'id'), channelJSON.id);
	if (channelIndex == -1) {
		json.channels.push(channelJSON);
	}
	else {
		json.channels[channelIndex] = channelJSON;
	}
	return save(enums.ADP_LOADED_JSON, json);
};

var loadServerChannel = function (id) {
	var json = getJsonFromKey(enums.ADP_SERVER_JSON);
	if (!json || !json.channels)
		return false;

	var channel = _(json.channels).findWhere({ id: id }) || false;
	return channel;
};

var loadChannel = function (id) {
	var json = getJsonFromKey(enums.ADP_LOADED_JSON);
	if (!json.channels)
		return false;

	return _(json.channels).findWhere({ id: id }) || false;
};

var areObjectsChanged = function (obj1, obj2) {
	obj1 = cleanJson(obj1);
	obj2 = cleanJson(obj2);
	return Utils.deepDiffMapper.test(obj1, obj2).isChanged;
};

var isChannelChanged = function (channelJson) {
	var localChannel = loadChannel(channelJson.id);
	if (!localChannel)
		return true;
	return areObjectsChanged(channelJson, localChannel);
};

var loadSiteData = function () {
	return getJsonFromKey(enums.ADP_LOADED_JSON);
};

var isSiteChanged = function (siteJson) {
	var localJson = loadSiteData();
	if (!localJson)
		return true;
	return areObjectsChanged(siteJson, localJson);
};

var deleteChannel = function (channelId) {
	var json = getJsonFromKey(enums.ADP_LOADED_JSON);
	if (!json.channels)
		return true;

	json.channels = _(json.channels).reject({ id: channelId });
	save(enums.ADP_LOADED_JSON, json);
	return true;
};



export default { saveServerData, saveLoadedData, saveLoadedChannel, loadChannel, loadServerChannel, loadSiteData, isSiteChanged, isChannelChanged, deleteChannel };;
