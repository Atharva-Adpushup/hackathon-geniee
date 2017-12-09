// Pub-Sub module

var emitter = {
    events: {},
    publish: function (event, data) {
        if (this.events.hasOwnProperty(event)) {
            this.events[event].forEach(function (listener) {
                listener(data);
            });
        }
    },
    subscribe: function (event, listener) {
        if (!this.events.hasOwnProperty(event)) {
            this.events[event] = [];
        }

        this.events[event].push(listener);
    }
};

module.exports = emitter;