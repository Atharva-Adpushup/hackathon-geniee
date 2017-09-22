function CustomError(message) {
	this.name = 'CustomError';
	this.message = message || 'adpushup error message';
	this.stack = new Error().stack;
}
CustomError.prototype = Object.create(Error.prototype);
CustomError.prototype.constructor = CustomError;
CustomError.prototype.toString = function() {
	return this.message.toString();
};

module.exports = CustomError;
