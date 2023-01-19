function CustomError(err, data) {
	this.name = 'CustomError';
	// convert undefineds into string 'undefined` to preserve the key in the object
	// require for debugging
	this.message = `${err.message} ::DATA:: ${JSON.stringify(data, (key, value) =>
		value === undefined ? 'undefined' : value
	)}`;
	this.stack = err.stack;
}

CustomError.prototype = new Error();

module.exports = CustomError;
