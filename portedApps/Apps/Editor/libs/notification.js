module.exports = (function() {
	var Notification = function(title, body, type) {
		this.title = title;
		this.body = body;
		this.type = type; //success, error, info, warning
		this.seen = false;
	};

	return Notification;
})();
