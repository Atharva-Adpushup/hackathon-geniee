import $ from 'jquery';
import Utils from './utils';
import Event from './event';

const Document = function() {
	this.allowMouseEvents = true;
	this.events = 'click mouseup mouseleave mousedown mouseover';
	this.onMouseMove = new Event();
	this.onMouseLeave = new Event();
	this.onMouseOver = new Event();
	this.onClick = new Event();
	this.onReady = new Event();

	this.eventHandler = Utils.bind(this.handleEvent, this);
	this.readyHandler = Utils.bind(this.handleReady, this);
	this.onReady.bind(this.readyHandler, this);
};
Document.prototype.handleReady = function() {
	$('html')
		.off(this.events)
		.on(this.events, this.eventHandler);
};

Document.prototype.changeEditorMode = function(mode) {
	this.allowMouseEvents = mode;
};

Document.prototype.highlightElement = function($el) {
	/* setInterval(function(){blink()}, 1000);
	var actualColor = $el.css("background-color");
	$el.css({"background-color":"black"})
	function blink() {

	}*/
};

Document.prototype.scrollElementToScreen = function(el) {
	if (!el || !el.length) return false;

	let elOffset = el.offset().top,
		elHeight = el.height(),
		windowHeight = $(window).height(),
		offset;

	if (elHeight < windowHeight) {
		offset = elOffset - (windowHeight / 2 - elHeight / 2);
	} else {
		offset = elOffset;
	}
	$(window).scrollTop(offset);
	this.highlightElement(el);
};

Document.prototype.handleEvent = function(e) {
	// isScriptedEvent, a variable that checks whether e was triggered by a script or not
	const isScriptedEvent =
			typeof e.originalEvent === 'undefined' ||
			(e.originalEvent.hasOwnProperty('isTrusted') && !e.originalEvent.isTrusted) ||
			(e.originalEvent.screenX === 0 && e.originalEvent.screenY === 0),
		isMouseEventsAllowed = this.allowMouseEvents,
		$target = $(e.target);

	if (!isScriptedEvent && isMouseEventsAllowed) {
		e.preventDefault();

		switch (e.type) {
			case 'mousemove':
				this.onMouseMove.fire($target);
				break;

			case 'click':
				this.onClick.fire($target, e);
				break;
			default:
				return;
		}
	}
};

export default Document;
