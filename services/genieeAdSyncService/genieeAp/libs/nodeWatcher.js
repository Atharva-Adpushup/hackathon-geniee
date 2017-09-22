'use strict';
var $ = require('jquery'),
	html = window.document.documentElement,
	matchFunction =
		html.matches ||
		html.matchesSelector ||
		html.webkitMatchesSelector ||
		html.mozMatchesSelector ||
		html.msMatchesSelector ||
		html.oMatchesSelector,
	sequence = 100,
	isAnimationSupported = false,
	animationstring = 'animationName',
	keyframeprefix = '',
	isDocReady = false,
	domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
	pfx = '',
	elm = document.createElement('div'),
	i;

$(function() {
	isDocReady = true;
});

if (typeof document.addEventListener === 'function') {
	if (elm.style.animationName) {
		isAnimationSupported = true;
	}

	if (isAnimationSupported === false) {
		for (i = 0; i < domPrefixes.length; i++) {
			if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
				pfx = domPrefixes[i];
				animationstring = pfx + 'AnimationName';
				keyframeprefix = '-' + pfx.toLowerCase() + '-';
				isAnimationSupported = true;
				break;
			}
		}
	}
}

function viaAnimation(selector, timeout, dfd) {
	var styleAnimation,
		animationName = 'insQ_' + sequence++,
		eventHandler = function(event) {
			if (event.animationName === animationName || event[animationstring] === animationName) {
				if (matchFunction.call(event.target, selector)) {
					dfd.resolve($(event.target), 2);
					cleanUp();
				}
			}
		};

	styleAnimation = document.createElement('style');
	styleAnimation.innerHTML =
		'@' +
		keyframeprefix +
		'keyframes ' +
		animationName +
		' {  from {  opacity: 0.99;  } to {  opacity: 1; }  }' +
		'\n' +
		selector +
		' { animation-duration: 0.001s; animation-name: ' +
		animationName +
		'; ' +
		keyframeprefix +
		'animation-duration: 0.001s; ' +
		keyframeprefix +
		'animation-name: ' +
		animationName +
		'; ' +
		' } ';
	document.head.appendChild(styleAnimation);

	document.addEventListener('animationstart', eventHandler, false);
	document.addEventListener('MSAnimationStart', eventHandler, false);
	document.addEventListener('webkitAnimationStart', eventHandler, false);

	function cleanUp() {
		if (styleAnimation) {
			document.head.removeChild(styleAnimation);
			styleAnimation = null;
		}
		document.removeEventListener('animationstart', eventHandler);
		document.removeEventListener('MSAnimationStart', eventHandler);
		document.removeEventListener('webkitAnimationStart', eventHandler);
	}

	$(function() {
		if (dfd.state() === 'pending') {
			setTimeout(function() {
				if (dfd.state() !== 'pending') {
					return false;
				}

				cleanUp();
				dfd.reject(selector, 2);
			}, timeout || 10000);
		}
	});
}

function viaTimer(selector, timeout, dfd) {
	var interval,
		$el = $(selector),
		intervalTime = 500,
		attempt = 1,
		maxAttempts = (timeout || 10000) / intervalTime;
	if ($el.length) {
		dfd.resolve($el, 1);
	} else {
		interval = setInterval(function() {
			$el = $(selector);
			if ($el.length) {
				clearInterval(interval);
				dfd.resolve($el, 1);
			} else if (isDocReady && attempt >= maxAttempts) {
				clearInterval(interval);
				dfd.reject(selector, 1);
			}
			attempt++;
		}, intervalTime);
	}
}

function isSelectorSupported(selector) {
	try {
		if (typeof document.querySelector === 'function') {
			document.querySelector(selector);
			return true;
		}
		return false;
	} catch (e) {
		return false;
	}
}

function listen(selector, timeout) {
	var dfd = $.Deferred();
	isAnimationSupported = false;
	if (isAnimationSupported && isSelectorSupported(selector)) {
		viaAnimation(selector, timeout, dfd);
	} else {
		viaTimer(selector, timeout, dfd);
	}

	return dfd.promise();
}

module.exports = {
	watch: listen
};
