const yup = require('yup');
const { DATA_SOURCE } = require('./constants');
const httpStatusConsts = require('../../../configs/httpStatusConsts');

const validationOptions = {
	strict: true
};

const middlewareSchema = yup.object().shape({
	source: yup
		.string()
		.oneOf(Object.values(DATA_SOURCE))
		.required()
});

function requestSchemaValidationMiddleware(requestSchema, source) {
	middlewareSchema.validateSync({ source }, validationOptions);

	return function requestSchemaValidator(req, res, next) {
		try {
			const data = req[source];
			requestSchema.validateSync(data, validationOptions);
			return next();
		} catch (err) {
			return res.status(httpStatusConsts.BAD_REQUEST).json({
				message: err.message
			});
		}
	};
}

module.exports = {
	middleware: requestSchemaValidationMiddleware,
	dataSources: DATA_SOURCE
};
