const CustomError = require('./CustomError');
const Emailer = require('./emailer');

const axiosErrorHandler = err => {
    console.log(err)
    if(err.response) {
        throw new CustomError(`${err.response.data.Message} - ${err.response.status} ${err.response.statusText}`)
    } else if(err.request) {
        throw new CustomError(`${err.toString()}`)
    } else {
        throw err;
    }
}
const partnerModuleErrorHandler = async (module, err) => {
    console.log(err)
    if(err instanceof CustomError) {
        await sendErrorNotification(err, module)
    }
    return {
        total: 0,
        anomalies: 0,
        partner: module,
        message: err.toString()
    };
}
const couchbaseErrorHandler = err => {
    console.log(err)
    if(err.message) {
        throw new CustomError(`${err.toString()} - ${err.code} ${err.message}`)
    } else {
        throw err;
    }
}

const sendErrorNotification = async (err, module) => {
    console.log(err)
    await Emailer.serviceErrorNotificationMailService(err, module);
}

module.exports = {
    axiosErrorHandler,
    partnerModuleErrorHandler,
    couchbaseErrorHandler,
    sendErrorNotification
}