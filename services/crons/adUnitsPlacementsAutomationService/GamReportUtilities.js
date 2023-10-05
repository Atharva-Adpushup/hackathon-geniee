const path = require('path');

const GamApiUtilities = require('./GamApiUtilities');

const { downloadFile } = require('./utils');

const {
    getPstDate,
    subtractDays,
    getDateObject
} = require('../../../helpers/commonFunctions');

const {
    GAM_API: {
        REPORT_SUCCESS_STATUS,
        DEFAULT_GAM_CONFIG,
        DEFAULT_TIME_PERIOD,
        DEFAULT_DATE_OFFSET
    },
    GAM_SERVICES: {
        DOWNLOAD_URL,
        REPORT_STATUS,
        RUN_REPORT
    },
    GAM_FOLDER_NAME
} = require('./constants');

class GamReportUtilities {
    constructor() {
        this.gamApiUtilities = new GamApiUtilities();
    }

    /**
     * Function to generate payload for fetching report from GAM
     * @param {Object} gamConfig 
     * @returns {Object} payload object for GAM report request
     */
    generateReportPayload(gamConfig) {
        const { whereClause } = gamConfig;
        let startDate = subtractDays(DEFAULT_TIME_PERIOD + DEFAULT_DATE_OFFSET - 1, getPstDate());
        let endDate = subtractDays(DEFAULT_DATE_OFFSET, getPstDate());

        const reportPayload = {
            ...DEFAULT_GAM_CONFIG,
            whereClause,
            startDate: getDateObject(startDate),
            endDate: getDateObject(endDate),
        }

        return reportPayload;
    }

    /**
     * Function to generate report and get its job id
     * @param {Object} reportPayload 
     * @returns {Promise <Number>} requested report's job id
     */
    generateReportJobId(reportPayload) {
        const url = this.gamApiUtilities.buildRequestUrl(RUN_REPORT);
        return this.gamApiUtilities.makePostRequest(url, reportPayload);
    }

    /**
     * Function to get the status of the report that is being fetched
     * @param {Number} reportJobId 
     * @returns {Promise <String>} the current status for the report
     */
    getReportStatus(reportJobId) {
        const url = this.gamApiUtilities.buildRequestUrl(REPORT_STATUS, reportJobId);
        return this.gamApiUtilities.makeGetRequest(url);
    }

    /**
     * Function to get the download url for the report being fetched
     * @param {Number} reportJobId 
     * @returns {Promise <String>} the url to download the report
     */
    async getReportDownloadUrl(reportJobId) {
        const reportStatus = await this.getReportStatus(reportJobId);

        if (!reportStatus) {
            return Promise.reject("No report status found for the current job");
        }

        //Retrying here if the report is in IN_PROGRESS state
        if (reportStatus !== REPORT_SUCCESS_STATUS) {
            return this.getReportDownloadUrl(reportJobId);
        }

        const url = this.gamApiUtilities.buildRequestUrl(DOWNLOAD_URL, reportJobId);
        return this.gamApiUtilities.makeGetRequest(url);
    }

    /**
     * Function to download gam report for the provided download url
     * @param {String} reportDownloadUrl 
     * @param {Object} gamConfig 
     * @returns {String} the filepath of the downloaded report
     */
    downloadReport(reportDownloadUrl, gamConfig) {
        const { siteId, filePath } = gamConfig;
        const reportDownloadPath = path.join(__dirname, `./${GAM_FOLDER_NAME}/${siteId}_${filePath}.csv`);

        console.log("Downloading report for:", siteId);

        return downloadFile(reportDownloadUrl, reportDownloadPath);
    }
}

module.exports = GamReportUtilities;