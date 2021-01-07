const Yup = require('yup');
const _ = require('lodash');

const getCustomStatsValidations = {
    siteid: Yup.string().when('isSuperUser', {
        is: true,
        then: Yup.string().optional(),
        otherwise: Yup.string().required('SiteId is required')
    }),
    isSuperUser: Yup.boolean().optional(),
    fromDate: Yup.string().required(),
    toDate: Yup.string().required(),
    interval: Yup.string().required(),
    dimension: Yup.string().optional(),
    bypassCache: Yup.boolean().optional()
};

const getMetaDataValidations = {
    siteid: Yup.string().when('isSuperUser', {
        is: true,
        then: Yup.string().optional(),
        otherwise: Yup.string().required('Sites required')
    }),
    isSuperUser: Yup.boolean().optional(),
    bypassCache: Yup.boolean().optional()
};

const getWidgetDataValidations = {
    path: Yup.string().required('Path is required'),
    params: Yup.object().optional(),
    bypassCache: Yup.boolean().optional()
}

module.exports = {
    getCustomStatsValidations,
    getMetaDataValidations,
    getWidgetDataValidations
}