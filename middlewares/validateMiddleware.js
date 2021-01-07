const _ = require('lodash');
const { sendErrorResponse } = require('../helpers/commonFunctions');
const ObjectValidator = require('../helpers/ObjectValidator');

const validateSchema = schema => (req, res, next) => {
	const validSchema = _.pick(schema, ['header', 'params', 'query', 'body']);
	const objectToValidate = _.pick(req, Object.keys(validSchema));

	return ObjectValidator(schema, objectToValidate)
		.then(() => next())
		.catch(err => sendErrorResponse({ message: err.message }, res, 400));
};

module.exports = validateSchema;
