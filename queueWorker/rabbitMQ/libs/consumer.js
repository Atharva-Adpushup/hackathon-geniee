var queueInstance = require('amqplib');
var Promise = require('bluebird');
var mailService = require('../../../services/mailService/index');

function Consumer(config) {
	this.config = config;
	this.channel = null;
	this.connection = null;
    this.negCounter = 0;
	this.getQueueMessage = function(queueName) {
		const self = this;

		if (self.connection && self.channel) {
		    return self.channel.get(queueName);
		} else {
			return Promise.reject('issue with rabbitmq connection or channel');
		}
	};

	this.connectRabbit = function() {
		const self = this;

		if (self.connection) {
			return Promise.resolve(self.connection);
		}

		return queueInstance.connect(self.config.url).then((conn) => {
			conn.on('close', () => {
				self.connection = null;
				self.channel = null;
				self.connectRabbit(self.config.url);
			});
			self.connection = conn;

			return self.registerChannel(conn)
					.then((ch) => {
						self.channel = ch;
						return self.checkExchange(ch);
					})
					.then(self.checkQueues.bind(self));
		}).catch(function (err) {
			console.log(err);
		});
	};
}

Consumer.prototype.registerChannel = function(conn){
	return conn.createConfirmChannel();
};

Consumer.prototype.checkExchange = function(ch) {
	return ch.checkExchange(this.config.exchange.name)
		.then(function(abc) {
			return ch;
		});
};

Consumer.prototype.checkQueues = function(ch) {
	var cloudStorageUploadQueueCheck = this.checkQueue(ch, this.config.queue.name);

	return Promise.join(cloudStorageUploadQueueCheck, function(q1) {
		return ch;
	});
};

Consumer.prototype.checkQueue = function(ch, queueName) {
	return ch.checkQueue(queueName);
};

Consumer.prototype.makeConnection = function() {
	return this.connectRabbit();
};

Consumer.prototype.getMessage = function(queueName) {
	const self = this;

	return this.checkQueue(this.channel, queueName).then(() => {
		return self.getQueueMessage(queueName);
	}).catch((err) => {
		console.log('err in checkqueue', err);
	});
};

Consumer.prototype.acknowledge = function(msg) {
	return this.channel.ack(msg);
};

Consumer.prototype.reject = function(msg) {
    if (this.negCounter && this.negCounter % 5 == 0) {
        mailService({
            header: `${this.config.mail.header || this.config.name} | Error Counter : ${this.negCounter}`,
            content: `${this.config.mail.content}`,
            emailId: this.config.mail.emailIds
        })
        .then(response => console.log(response.message))
        .catch(console.log);
    }
	return this.channel.nack(msg, false, true);
};

module.exports = Consumer;