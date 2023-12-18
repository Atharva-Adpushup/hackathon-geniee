const express = require('express');
const confirmRedisConnectionMiddleware = require('../../helpers/selectiveRollout/apiMiddleware/confirmRedisConnectionMiddleware');
const schemaValidationMiddlewares = require('./validation/validationMiddlewares');
const handlers = require('./handlers');

const router = express.Router();

router.use(confirmRedisConnectionMiddleware);

router.delete('/key', schemaValidationMiddlewares.deleteKey, handlers.deleteKey);
router.delete('/keys', schemaValidationMiddlewares.deleteKeys, handlers.deleteKeys);

module.exports = router;
