const axios = require('axios');

const ApiUtilities = require('../../../helpers/ApiUtilities');

const { 
    GAM_API: { SERVICE_URLS }, 
    GAM_SERVICES: {
        DOWNLOAD_URL,
        REPORT_STATUS,
        RUN_REPORT,
        SEARCH_PLACEMENT,
        UPDATE_PLACEMENT
    },
    DEFAULT_AXIOS_CONFIG_HEADERS
} = require('./constants');

class GamApiUtilities extends ApiUtilities{
    constructor () {
        super(DEFAULT_AXIOS_CONFIG_HEADERS);
    }

    makeGetRequest(url) {
        return axios.get(url, this.axiosConfig)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    }

    makePostRequest(url, payload) {
        return axios.post(url, payload, this.axiosConfig)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    }

    makePutRequest(url, payload) {
        return axios.put(url, payload, this.axiosConfig)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    }

    buildRequestUrl(service, queryParameter) {
        switch(service) {
            case REPORT_STATUS:
            case DOWNLOAD_URL:
                return SERVICE_URLS[service].replace('__REPORT_JOB_ID__', queryParameter);
            case SEARCH_PLACEMENT:
                return SERVICE_URLS[service].replace('__PLACEMENT_NAME__', queryParameter);
            case RUN_REPORT:
            case UPDATE_PLACEMENT:
            default:
                return SERVICE_URLS[service];
        }
    }
}

module.exports = GamApiUtilities;