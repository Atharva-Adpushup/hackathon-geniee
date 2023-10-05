/* eslint-disable class-methods-use-this */

class ApiUtilities {
	constructor(headers) {
		this.axiosConfig = {
			headers
		};
	}

	makeGetRequest() {
		throw new Error("Abstract method 'makeGetRequest' must be overridden by subclasses.");
	}

	makePostRequest() {
		throw new Error("Abstract method 'makePostRequest' must be overridden by subclasses.");
	}

	makePutRequest() {
		throw new Error("Abstract method 'makePutRequest' must be overridden by subclasses.");
	}
}

module.exports = ApiUtilities;
