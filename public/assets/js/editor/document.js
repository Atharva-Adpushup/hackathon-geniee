var Utils = require('../libs/custom/utils'),
	$ = require('../libs/third-party/jquery'),
	Messenger = require('../libs/custom/messenger'),
	Event = require('../libs/custom/event'),
	Selectorator = require('../libs/custom/cssSelectorator');


module.exports = (function($, Utils, Event, Messenger, Selectorator) {
	var Document = function() {
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
		$('html').off(this.events).on(this.events, this.eventHandler);
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
		if (!el || !el.length)
			return false;

		var elOffset = el.offset().top,
			elHeight = el.height(),
			windowHeight = $(window).height(),
			offset;

		if (elHeight < windowHeight) {
			offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
		}
		else {
			offset = elOffset;
		}
		$(window).scrollTop(offset);
		this.highlightElement(el);
	};

	Document.prototype.handleEvent = function(e) {
		// isScriptedEvent, a variable that checks whether e was triggered by a script or not
		var isScriptedEvent = (typeof e.originalEvent === 'undefined') || (e.originalEvent.hasOwnProperty('isTrusted') && !e.originalEvent.isTrusted) || (e.originalEvent.screenX === 0 && e.originalEvent.screenY === 0),
			isMouseEventsAllowed = this.allowMouseEvents, $target = $(e.target);

		if (!isScriptedEvent && isMouseEventsAllowed) {
			e.preventDefault();

			switch (e.type) {
				case 'mouseleave':
					this.onMouseLeave.fire($target);
					break;

				case 'mousemove':
					this.onMouseMove.fire($target);
					break;

				case 'mouseover':
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
	return Document;
})($, Utils, Event, Messenger, Selectorator);
