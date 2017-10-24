$(document).ready(function() {
	(function(w, d, $) {
		var a = (w.adpushup = w.adpushup || {});

		a.log = function(msg) {
			if (typeof console != 'undefined' && typeof console.log === 'function') {
				console.log(msg);
			}
		};

		a.detectExtension = (function(extensionId, callback) {
			var img;
			img = new Image();
			img.src = 'chrome-extension://' + extensionId + '/images/icon.png';
			img.onload = function() {
				callback(true);
			};
			img.onerror = function() {
				callback(false);
			};
		})('nbbbgcccgkkkemfmbjmbelkcgjlpibon', function(installed) {
			if (!installed) {
				$('#extension-overlay').show();
			}
		});

		a.notify = function(title, message, slide) {
			var opts, container;
			opts = {};
			opts.classes = ['smokey'];
			opts.classes.push('slide');
			$('#freeow-tr').freeow(title, message, opts);
		};

		a.alert = function(message, container, type) {
			$(container).html(
				$('<div/>')
					.css({
						width: '75%',
						'text-align': 'center',
						margin: '50px auto'
					})
					.attr({
						role: 'alert',
						class: 'alert ' + (type == 1 ? 'alert-success' : type == 2 ? 'alert-danger' : 'alert-info')
					})
					.html(message)
			);
		};

		a.showLoader = function(container, cssClass) {
			cssClass = cssClass ? cssClass : '';
			$(container).html(
				$('<div/>')
					.attr({
						class: 'loaderwrapper spinner ' + cssClass
					})
					.html('<img src="/assets/images/loaderLogo.png">')
			);
		};

		a.apAlert = function(message, container, type, animation) {
			switch (animation) {
				case 'slideDown':
					$(container)
						.addClass('apalert-' + type)
						.html(message + ' <span class="close">x</span>')
						.slideDown();
					break;
				default:
					$(container)
						.addClass('apalert-' + type)
						.html(message + ' <span class="close">x</span>')
						.show();
					break;
			}
		};

		$(document).on('click', '.close', function() {
			$(this)
				.closest('.detectap-alert')
				.slideUp();
		});

		$(function() {
			if (typeof w.location.hash === 'string') {
				var hash = w.location.hash;

				if (hash.indexOf('#addSite') >= 0) {
					$('#addSite').modal('show');
				}
			}
		});
	})(window, document, jQuery);
});
