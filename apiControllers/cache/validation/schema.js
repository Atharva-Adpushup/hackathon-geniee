const yup = require('yup');
const {
	REDIS: { INVALID_KEY, INVALID_KEY_PATTERN }
} = require('../../../configs/commonConsts');

module.exports = {
	deleteKey: yup.object().shape({
		key: yup.string().required(INVALID_KEY)
	}),
	deleteKeys: yup.object().shape({
		keyPattern: yup.string().required(INVALID_KEY_PATTERN)
	})
};
