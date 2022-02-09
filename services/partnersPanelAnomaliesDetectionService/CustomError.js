function CustomError(message, isAuthError) {
	this.name = 'CustomError';
	this.message = message;
	this.stack = new Error().stack;
	this.isAuthError = isAuthError;
}
CustomError.prototype = new Error();

module.exports = CustomError;
