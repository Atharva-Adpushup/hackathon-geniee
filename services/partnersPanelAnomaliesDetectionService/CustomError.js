function CustomError(message) {
	this.name = 'CustomError';
	this.message = message;
	this.stack = new Error().stack;
}
CustomError.prototype = new Error();

module.exports = CustomError;
