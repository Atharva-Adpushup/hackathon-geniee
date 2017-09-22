import $ from 'jquery';
import Utils from './utils';

const Event = function(isOneTime) {
	this.arguments = [];
	this.oneTime = isOneTime || false;
	this.subscribers = [];
	this.isFired = false;
};

Event.prototype.add = function(subsCallback) {
	this.isFired ? subsCallback.apply(this, this.arguments) : this.subscribers.push(subsCallback);
};
Event.prototype.bind = function() {
	this.add(Utils.bind.apply(this, arguments));
};
Event.prototype.clear = function() {
	this.subscribers = [];
};
Event.prototype.fire = function(a) {
	this.arguments = arguments;
	this.oneTime && (this.isFired = true);
	$.each(
		this.subscribers,
		Utils.bind(function(a, c) {
			c.apply(this, this.arguments);
		}, this)
	);
};
Event.prototype.reset = function() {
	this.isFired = false;
};

export default Event;
