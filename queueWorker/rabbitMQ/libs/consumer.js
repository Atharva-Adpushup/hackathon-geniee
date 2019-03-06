const queueInstance = require('amqplib');
const Promise = require('bluebird');
const moment = require('moment');
const mailService = require('../../../services/mailService/index');
const globalConfig = require('../../../configs/config');

function Consumer(config) {
	this.config = config;
	this.channel = null;
	this.connection = null;
	this.negCounter = 0;
	this.isStaging = !!globalConfig.environment.IS_STAGING;
	this.getQueueMessage = function(queueName) {
		const self = this;

		if (self.connection && self.channel) {
			return self.channel.get(queueName);
		}
		return Promise.reject('issue with rabbitmq connection or channel');
	};

	this.connectRabbit = function() {
		const self = this;

		if (self.connection) {
			return Promise.resolve(self.connection);
		}

		return queueInstance
			.connect(
				self.config.url,
				{ hearbeat: 20 }
			)
			.then(conn => {
				conn.on('close', () => {
					console.log(
						`Consumer close event caught | Current Time : ${moment().format(
							'dddd, MMMM Do YYYY, h:mm:ss a'
						)}`
					);
					self.connection = null;
					self.channel = null;
					self.connectRabbit(self.config.url);
				});
				conn.on('error', () => {
					console.log(
						`Consumer error event caught | Current Time : ${moment().format(
							'dddd, MMMM Do YYYY, h:mm:ss a'
						)}`
					);
					self.connection = null;
					self.channel = null;
					self.connectRabbit(self.config.url);
				});
				self.connection = conn;

				return self
					.registerChannel(conn)
					.then(ch => {
						self.channel = ch;
						return self.checkExchange(ch);
					})
					.then(self.checkQueues.bind(self));
			})
			.catch(err => {
				console.log(err);
			});
	};
}

Consumer.prototype.registerChannel = function(conn) {
	return conn.createConfirmChannel();
};

Consumer.prototype.checkExchange = function(ch) {
	return ch.checkExchange(this.config.exchange.name).then(abc => ch);
};

Consumer.prototype.checkQueues = function(ch) {
	const cloudStorageUploadQueueCheck = this.checkQueue(ch, this.config.queue.name);

	return Promise.join(cloudStorageUploadQueueCheck, q1 => ch);
};

Consumer.prototype.checkQueue = function(ch, queueName) {
	return ch.checkQueue(queueName);
};

Consumer.prototype.makeConnection = function() {
	return this.connectRabbit();
};

Consumer.prototype.getMessage = function(queueName) {
	const self = this;

	return this.checkQueue(this.channel, queueName)
		.then(() => self.getQueueMessage(queueName))
		.catch(err => {
			console.log('err in checkqueue', err);
		});
};

Consumer.prototype.sendMail = function(data) {
	if (this.isStaging) {
		console.log(
			'Staging environment found. Moking Mail sent. You will not receive any mail. This is the mail'
		);
		return Promise.resolve();
	}

	return mailService({
		header: `${data.header || this.config.name} | Error Counter : ${this.negCounter}`,
		content: `${data.content}`,
		emailId: data.emailId
	})
		.then(response => console.log(response.message))
		.catch(console.log);
};

Consumer.prototype.acknowledge = function(msg) {
	if (this.negCounter && this.negCounter % 2 == 0) {
		this.sendMail({
			header: this.config.mail.ack.header,
			content: this.config.mail.ack.content,
			emailId: this.config.mail.emailId
		});
		this.negCounter = 0;
	}
	return this.channel.ack(msg);
};

Consumer.prototype.reject = function(msg) {
	if (this.negCounter && this.negCounter % 2 == 0 && this.negCounter < 50) {
		this.sendMail({
			header: this.config.mail.nack.header,
			content: this.config.mail.nack.content,
			emailId: this.config.mail.emailId
		});
	}
	this.negCounter++;
	return this.channel.nack(msg, false, true);
};

module.exports = Consumer;
