const { 
    ADPUSHUP_GAM: { 
        GAM_API_HOST, 
        REFRESH_TOKEN, 
        ACTIVE_DFP_NETWORK 
    }, 
    couchBase 
} = require('../../../configs/config');
const { docKeys } = require('../../../configs/commonConsts');

const GAM_BASE_URL = `${GAM_API_HOST}/service`;

const GAM_SERVICES = {
    REPORT_STATUS: 'REPORT_STATUS',
    DOWNLOAD_URL: 'DOWNLOAD_URL',
    RUN_REPORT: 'RUN_REPORT',
    SEARCH_PLACEMENT: 'SEARCH_PLACEMENT',
    UPDATE_PLACEMENT: 'UPDATE_PLACEMENT'
}

module.exports = {
    GAM_SERVICES,
    GAM_API: {
        DEFAULT_GAM_CONFIG: {
            'reportCurrency': 'USD',
            'dimensions': ['AD_UNIT_NAME', 'AD_UNIT_ID'],
            'columns': ['TOTAL_CODE_SERVED_COUNT'],
            'dateRangeType': 'CUSTOM_DATE'
        },
        DEFAULT_TIME_PERIOD: 5,
        DEFAULT_DATE_OFFSET: 2,
        REPORT_SUCCESS_STATUS: 'COMPLETED',
        SERVICE_URLS: {
            [GAM_SERVICES.REPORT_STATUS]: `${GAM_BASE_URL}/reporting/report-status?reportJobId=__REPORT_JOB_ID__`,
            [GAM_SERVICES.DOWNLOAD_URL]: `${GAM_BASE_URL}/reporting/download-url?reportJobId=__REPORT_JOB_ID__`,
            [GAM_SERVICES.RUN_REPORT]: `${GAM_BASE_URL}/reporting/run-report`,
            [GAM_SERVICES.SEARCH_PLACEMENT]: `${GAM_BASE_URL}/placements/search?dimension=name&pattern=__PLACEMENT_NAME__`,
            [GAM_SERVICES.UPDATE_PLACEMENT]: `${GAM_BASE_URL}/placements`
        }
    },
    DEFAULT_AXIOS_CONFIG_HEADERS: {
        'Content-Type': 'application/json',
        'refresh_token': REFRESH_TOKEN,
        'network_code': ACTIVE_DFP_NETWORK
    },
    PLACEMENT_NAME_PREFIX: "Banner_Placement",
    PLACEMENT_STATE: {
        ACTIVE: "ACTIVE",
        INACTIVE: "INACTIVE",
        ARCHIVED: "ARCHIVED"
    },
    PLACEMENT_UPDATE_STATUS: {
        COMPLETED: "COMPLETED",
        FAIL: "FAIL"
    },
    MAX_UNITS_IN_PLACEMENT: 999,
    MAX_RETRIES: 3,
    DEFAULT_MINIMUM_AD_CODE_SERVED_COUNT: 0,
    BATCH_SIZE: 5,
    GAM_FOLDER_NAME: 'gamData',
    DOWNLOAD_RESPONSE_TYPE: 'stream',
    IN_BETWEEN_BATCHES_DELAY: 500,
    COUCHBASE_QUERIES: {
        FETCH_FP_SITES: `
            SELECT siteId from ${couchBase.DEFAULT_BUCKET} 
            WHERE META().id LIKE "${docKeys.site}%" 
            AND apps.floorEngine = TRUE
        `,
        UPDATE_PLACEMENT_STATUS: `
            UPDATE ${couchBase.DEFAULT_BUCKET}
            SET currentPlacement = 
                CASE 
                    WHEN (currentPlacement IS MISSING) THEN {}
                    ELSE currentPlacement
                END,
                currentPlacement.lastRunStatus=__STATUS__,
                currentPlacement.lastRunTime=__LAST_RUN__
            WHERE META().id LIKE "${docKeys.globalFloorEngineConfig}"
            RETURNING currentPlacement
        `,
        UPDATE_PLACEMENT: `UPDATE ${couchBase.DEFAULT_BUCKET}
            SET currentPlacement=__CURRENT_PLACEMENT__
            WHERE META().id LIKE "${docKeys.globalFloorEngineConfig}" 
            RETURNING currentPlacement
        `
    }
}