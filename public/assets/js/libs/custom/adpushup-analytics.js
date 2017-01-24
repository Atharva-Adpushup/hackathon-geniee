var adpushupAnalyticsEvents = {
  events: {},
  on: function (eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  },
  off: function(eventName, fn) {
    if (this.events[eventName]) {
      for (var i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      };
    }
  },
  emit: function (eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function(fn) {
        fn(data);
      });
    }
  }
};

adpushupAnalyticsEvents.on('analyticsAlias', analyticsAlias);
adpushupAnalyticsEvents.on('analyticsIdentify', analyticsIdentify);
adpushupAnalyticsEvents.on('analyticsTrack', analyticsTrack);

function analyticsAlias(data) {
    analytics.alias(data.email);
}

function analyticsIdentify(data) {
    analytics.identify(data.email, data.analytics, data.intercom);
}

function analyticsTrack(data) {
    analytics.track(data.eventName, data.obj, data.intercom);
}