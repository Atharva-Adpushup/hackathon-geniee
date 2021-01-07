const Yup = require('yup');
const AdPushupError = require('../helpers/AdPushupError');

const ObjectValidator = (validationSchema, objectToValidate) =>
    Yup.object().shape(validationSchema)
        .validate(objectToValidate)
        .catch(err => {
            throw new AdPushupError(err.message);
        })

module.exports = ObjectValidator;