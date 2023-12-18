const {
	middleware: schemaValidationMiddleware,
	dataSources: { REQUEST_BODY }
} = require('../../../helpers/routing/validation/requestSchemaValidation');

const { deleteKey, deleteKeys } = require('./schema');

module.exports = {
	deleteKey: schemaValidationMiddleware(deleteKey, REQUEST_BODY),
	deleteKeys: schemaValidationMiddleware(deleteKeys, REQUEST_BODY)
};
