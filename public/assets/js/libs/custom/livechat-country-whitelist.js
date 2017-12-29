function ADP_LC(W, $) {
	this.isCountryWhiteListed = false;
	this.isChatStarted = false;
	this.isWidgetShown = false;
	this.API = W.LC_API || {};
	this.model = null;
	this.$ = $;
	this.constants = {
		URL: {
			locationInfo: 'http://e3.adpushup.com/IpLocationPublicWebService/GetLocationInfo'
		}
	};
	this.countryList = ['AU', 'BR', 'CA', 'FR', 'DE', 'IL', 'IT', 'NL', 'AN', 'ES', 'SE', 'CH', 'GB', 'US'];
	this.$widgetContainer = null;
}

ADP_LC.prototype.disableSounds = function() {
	this.API.disable_sounds();
};

ADP_LC.prototype.setWidgetShown = function(value) {
	this.isWidgetShown = value;
};

ADP_LC.prototype.setCountryWhiteList = function(value) {
	this.isCountryWhiteListed = value;
};

ADP_LC.prototype.hideWidget = function() {
	this.$widgetContainer.hide();
};

ADP_LC.prototype.showWidget = function() {
	this.$widgetContainer.show();
};

ADP_LC.prototype.isWidgetHidden = function() {
	return this.API.chat_window_hidden();
};

ADP_LC.prototype.isVisitorEngaged = function() {
	return this.API.visitor_engaged();
};

ADP_LC.prototype.validateWidgetVisibility = function() {
	var _ref = this,
		isWidgetHidden = _ref.isWidgetHidden(),
		// isVisitorEngaged = _ref.isVisitorEngaged(),
		isCountryWhiteListed = _ref.isCountryWhiteListed,
		isChatStarted = _ref.isChatStarted,
		isWidgetValid = isWidgetHidden && isCountryWhiteListed && !isChatStarted;

	if (!isWidgetValid) {
		_ref.hideWidget();
		return;
	}

	_ref.setWidgetShown(true);
	_ref.showWidget();
};

ADP_LC.prototype.bindChatStartHandler = function() {
	var _ref = this;

	_ref.API.on_chat_started = function() {
		_ref.isChatStarted = true;
	};
};

ADP_LC.prototype.bindBeforeLoadHandler = function() {
	var _ref = this;

	_ref.API.on_before_load = function() {
		_ref.$widgetContainer = _ref.$('#livechat-compact-container');
		_ref.validateWidgetVisibility();
		_ref.fetchCountryData();
	};
};

ADP_LC.prototype.bindAfterLoadHandler = function() {
	var _ref = this;

	_ref.API.on_after_load = function() {
		var isWidgetShown = _ref.isWidgetShown,
			isCountryWhiteListed = _ref.isCountryWhiteListed,
			isWidgetValid = isWidgetShown && isCountryWhiteListed;

		if (!isWidgetValid) {
			_ref.disableSounds();
		}
	};
};

ADP_LC.prototype.fetchCountryData = function() {
	var _ref = this;

	_ref.$.get(_ref.constants.URL.locationInfo, function(response) {
		var isResponseData = !!(response && response.data && response.data.country),
			isCountryWhiteListed = !!(isResponseData && _ref.countryList.indexOf(response.data.country) > -1);

		if (!isCountryWhiteListed) {
			_ref.hideWidget();
			return;
		}

		_ref.model = _ref.$.extend(true, {}, response.data);
		_ref.setCountryWhiteList(true);
		_ref.validateWidgetVisibility();
	});
};

ADP_LC.prototype.init = function() {
	this.bindBeforeLoadHandler();
	this.bindAfterLoadHandler();
	this.bindChatStartHandler();
};

var globalInterval = setInterval(checkLCAPIExistence, 100);
function checkLCAPIExistence() {
	var w = window,
		isAPIExist = !!(w.LC_API && typeof w.LC_API === 'object' && 'chat_window_hidden' in w.LC_API),
		instance;

	console.log('Is LC_API loaded: ', isAPIExist);

	if (!isAPIExist) {
		return;
	}

	clearInterval(globalInterval);
	instance = new ADP_LC(window, jQuery);
	instance.init();
}
