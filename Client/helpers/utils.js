export default {
	btoa(stringifiedData) {
		return Buffer.from(stringifiedData).toString('base64');
	},
	atob(b64Encoded) {
		return Buffer.from(b64Encoded, 'base64').toString();
	}
};
