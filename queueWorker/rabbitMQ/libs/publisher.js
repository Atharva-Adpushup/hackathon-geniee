const queueInstance = require('amqplib');
const Promise = require('bluebird');
const moment = require('moment');

function Publisher(config) {
	this.config = config;
	this.channel = null;
	this.connection = null;
	this.offlineQueue = [];
	this.publishMsg = function(queueName, msg, options) {
		const me = this;

		return new Promise((resolve, reject) => {
			if (me.connection && me.channel) {
				me.channel.publish(me.config.exchange.name, queueName, msg, options);
				return resolve('done');
			} else {
				me.offlineQueue.push({ queueName, msg, options });
				return reject(
					'issue with rabbitmq connection or channel, messages queued up to be delivered on reconnection'
				);
			}
		});
	};
	this.manageOfflineQueue = function() {
		while (this.offlineQueue.length) {
			const msg = this.offlineQueue.shift();

			this.publishMsg(msg.queueName, msg.msg, msg.options);
		}
	};
	this.connectRabbit = function() {
		const me = this;

		if (me.connection) {
			return Promise.resolve(me.connection);
		}

		return queueInstance
			.connect(me.config.url, { hearbeat: 60 })
			.then(function(conn) {
				conn.on('close', function() {
					console.log(
						`Publisher connection close event caught | Current Time : ${moment().format(
							'dddd, MMMM Do YYYY, h:mm:ss a'
						)}`
					);
					me.connection = null;
					me.channel = null;
					me.connectRabbit(me.config.url);
					return;
				});
				conn.on('error', function() {
					console.log(
						`Publisher connection error event caught | Current Time : ${moment().format(
							'dddd, MMMM Do YYYY, h:mm:ss a'
						)}`
					);
					me.connection = null;
					me.channel = null;
					me.connectRabbit(me.config.url);
					return;
				});
				me.connection = conn;

				return me
					.registerChannel(conn)
					.then(function(ch) {
						me.channel = ch;
						ch.on('close', () => {
							console.log(
								`Publisher channel close event caught | Current Time : ${moment().format(
									'dddd, MMMM Do YYYY, h:mm:ss a'
								)}`
							);
							me.connection = null;
							me.channel = null;
							me.connectRabbit(me.config.url);
							return;
						});
						ch.on('error', () => {
							console.log(
								`Publisher channel error event caught | Current Time : ${moment().format(
									'dddd, MMMM Do YYYY, h:mm:ss a'
								)}`
							);
							me.connection = null;
							me.channel = null;
							me.connectRabbit(me.config.url);
							return;
						});
						return me.registerExchange(ch);
					})
					.then(me.registerQueues.bind(me))
					.then(function() {
						me.manageOfflineQueue();
						return me.channel;
					});
			})
			.catch(function(err) {
				console.log(err);
			});
	};
}

Publisher.prototype.registerChannel = function(conn) {
	return conn.createChannel();
};

Publisher.prototype.registerExchange = function(ch) {
	return ch
		.assertExchange(this.config.exchange.name, this.config.exchange.type, this.config.exchange.options)
		.then(function() {
			return ch;
		});
};

Publisher.prototype.registerQueues = function(ch) {
	const queueRegistration = this.registerQueue(
		ch,
		this.config.queue.name,
		this.config.queue.options,
		this.config.exchange
	);

	return Promise.join(queueRegistration, function() {
		return '';
	});
};

Publisher.prototype.registerQueue = function(ch, queueName, options) {
	const me = this;

	return ch.assertQueue(queueName, options).then(function() {
		return ch.bindQueue(queueName, me.config.exchange.name, queueName);
	});
};

Publisher.prototype.makeConnection = function() {
	return this.connectRabbit();
};

Publisher.prototype.publish = function(queueName, msg, options) {
	if (typeof msg == 'object') {
		msg = JSON.stringify(msg);
	}
	return this.publishMsg(queueName, new Buffer(msg, 'utf8'), options);
};

module.exports = Publisher;
