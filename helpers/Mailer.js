var Email = require('emailjs'),
	Class = require('./class'),
	Promise = require('bluebird'),
	AdPushupError = require('./AdPushupError'),
	Mailer = Class.extend(function() {
		this.config = {};
		this.type = 'text';
		this.server = {};

		this.constructor = function(config, type) {
			this.config = config;
			this.type = type ? type : this.type;
			var that = this;

			this.server = Email.server.connect({
				user: that.config.SMTP_USERNAME,
				password: that.config.SMTP_PASSWORD,
				host: that.config.SMTP_SERVER,
				ssl: true
			});
		};

		this.send = function(config) {
			var mailMessage = {
				from: this.config.MAIL_FROM,
				to: config.to,
				subject: config.subject
			};

			if (config.cc) {
				mailMessage.cc = config.cc;
			}

			if (this.type === 'html' && config.html) {
				mailMessage.attachment = [{ data: config.html, alternative: true }];
			} else if (this.type === 'text' && config.text) {
				mailMessage.text = config.text;
			}

			return new Promise(
				function(resolve) {
					this.server.send(mailMessage, function(err, message) {
						if (err) {
							throw new AdPushupError(err);
						} else if (message) {
							resolve();
						}
					});
				}.bind(this)
			);
		};
	});

module.exports = Mailer;
