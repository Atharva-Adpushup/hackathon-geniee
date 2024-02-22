const cron = require('node-cron');

const GamReportUtilities = require('./GamReportUtilities');
const PlacementUtilities = require('./PlacementUtilities');
const couchbaseService = require('../../../helpers/couchBaseService');
const {
    initializeGamDataFolder,
    clearGamDataFolder,
    getAdUnitIds,
    getRawDataByFilePath
} = require('./utils');
const { createBatches, handleErrorAndSendMail, delay } = require('../../../helpers/commonFunctions');

const {
    BATCH_SIZE,
    COUCHBASE_QUERIES,
    PLACEMENT_UPDATE_STATUS,
    IN_BETWEEN_BATCHES_DELAY,
    MAX_RETRIES,
} = require('./constants');
const { adUnitsPlacementAutomationAlerts: { supportMails } } = require('../../../configs/config');
const { cronSchedule, PROMISE_RESOLVE_STATUS } = require('../../../configs/commonConsts');

let gamReportUtilities;
let placementUtilities;

/**
 * Function to get all the site ids where floor engine is active
 * @returns {Array} all the site ids where floor engine is active
 */
async function getActiveFloorEngineSiteIds() {
    console.log("\n--------------------- FETCHING FLOOR ENGINE SITES ---------------------\n");

    const queryToFetchSiteIds = COUCHBASE_QUERIES.FETCH_FP_SITES;

    return couchbaseService.queryFromAppBucket(queryToFetchSiteIds)
        .then((siteIdObjects) => siteIdObjects.map(siteIdObject => siteIdObject.siteId))
        .catch(error => { throw error; });
}

/**
 * Function to get and save ad unit data for the given site id
 * @param {Number} siteId
 * @returns {Promise <Array>} all the ad unit ids for the given site id
 */
function getAdUnitDataForSite (siteId) {
    /**
     * STEP 1: Generate payload for downloading report for the provide gam config
     * STEP 2: Fetch the report and its reportJobId
     * STEP 3: Get the download url for the report by providing the reportJobId
     * STEP 4: Download the report
     * STEP 5: Return the downloaded report's filepath
     * STEP 6: Get raw data and return the eligible ad unit ids
     */

    const gamConfig = {
        siteId,
        filePath: "adUnit",
        whereClause: `WHERE AD_UNIT_NAME LIKE '%ADP_${siteId}%'`
    };

    const reportPayload = gamReportUtilities.generateReportPayload(gamConfig);

    return gamReportUtilities.generateReportJobId(reportPayload)
        .then((reportJobId) => gamReportUtilities.getReportDownloadUrl(reportJobId))
        .then((reportDownloadUrl) => gamReportUtilities.downloadReport(reportDownloadUrl, gamConfig))
        .then((reportDownloadPath) => getRawDataByFilePath(reportDownloadPath))
        .then((rawAdUnitsData) => getAdUnitIds(rawAdUnitsData))
        .catch(error => {
            throw { siteId, error }
        });
}

/**
 * Function to filter out ad units which are not present in any placement
 * @param {Array} adUnitIds
 * @returns {Array} array of new ad units
 */
function filterOutNewUnits(adUnitIds) {
    if(!adUnitIds) {
        return [];
    }
    let adUnitsAlreadyPresent = placementUtilities.getAdUnitsAlreadyPresent();
    return adUnitIds.filter(adUnitId => adUnitsAlreadyPresent.indexOf(adUnitId) === -1);
}

/**
 * Function to separate out rejected and fulfilled promises to process further
 * @param {Promises <Array>} allSettledPromises
 * @returns {Object} ad unit ids to process and rejected siteids which should be retried
 */
function filterBatchesToProcessAndRetry(allSettledPromises) {
    let adUnitIdsBatchesToProcess = allSettledPromises
        .filter(result => result.status === PROMISE_RESOLVE_STATUS.FULFILLED)
        .map(result => result.value);

    let siteIdsToRetry = allSettledPromises
        .filter(result => result.status === PROMISE_RESOLVE_STATUS.REJECTED)
        .map(result => result.reason.siteId);

    return { adUnitIdsBatchesToProcess, siteIdsToRetry };
}

/**
 * Function to get all the ad units and filter out new ones
 * @param {Array} siteIds
 * @returns {Array} all the new units to be added
 */
async function getNewAdUnitsNotAddedInPlacements(siteIds, retryCount = 0) {
    let unitsToAdd = [];
    const adUnitIdsPromises = siteIds.map((siteId) => getAdUnitDataForSite(siteId));
    const allSettledPromises = await Promise.allSettled(adUnitIdsPromises);
    const { adUnitIdsBatchesToProcess, siteIdsToRetry } = filterBatchesToProcessAndRetry(allSettledPromises);

    adUnitIdsBatchesToProcess.forEach(adUnitIdBatch => {
        let newUnits = filterOutNewUnits(adUnitIdBatch);
        unitsToAdd.push(...newUnits);
    });

    if (siteIdsToRetry.length > 0 && retryCount < MAX_RETRIES) {
        console.log("\nRetrying fetching ad unit ids for these sites:", siteIdsToRetry);
        let newUnits = await getNewAdUnitsNotAddedInPlacements(siteIdsToRetry, ++retryCount);
        unitsToAdd.push(...newUnits);
    }

    console.log("\nNew units to add:", unitsToAdd);
    return unitsToAdd;
}

/**
 * Function to process all data in batches and get all the units to be added in placements
 * @param {Array} siteIds
 * @returns {Array} all the new units to be added
 */
async function processDataInBatches (siteIds) {
    const siteBatches = createBatches(siteIds, BATCH_SIZE);
    let finalUnitsToAdd = [];

    console.log("Total Sites:", siteIds.length);
    console.log("Number of Batches:", siteBatches.length);

    for (let siteBatchIndex = 0; siteBatchIndex < siteBatches.length; siteBatchIndex++) {
        console.log(`\n--------------------- PROCESSING DATA FOR BATCH ${siteBatchIndex + 1} ---------------------\n`);
        let unitsToAdd = await getNewAdUnitsNotAddedInPlacements(siteBatches[siteBatchIndex]);
        finalUnitsToAdd.push(...unitsToAdd);
        await delay(IN_BETWEEN_BATCHES_DELAY); //Adding a minor delay so that GAM API doesn't cross read limit
    }

    console.log("\nTotal new units to be added:", finalUnitsToAdd.length);

    return finalUnitsToAdd;
}

/**
 * Function to initialize all the utilities
 * @returns {Promise <void>} resolve when the data dump directory is already present or successfully created
 */
function initializeUtilities() {
    gamReportUtilities = new GamReportUtilities();
    placementUtilities = new PlacementUtilities();

    return initializeGamDataFolder();
}

function main() {
    /**
     * STEP 1: Initialize utilities
     * STEP 2: Check and create data dump folder for storing downloaded data
     * STEP 3: Fetch and save placement which is eligible for adding ad units
     * STEP 4: Get sites where floor engine is active
     * STEP 5: Get ad units which are not currently present in the placements
     * STEP 6: Add the new units to the eligible placement
     * STEP 7: Delete the data dump folder
     */

    return initializeUtilities()
        .then(placementUtilities.fetchAndSaveNewPlacements.bind(placementUtilities))
        .then(getActiveFloorEngineSiteIds)
        .then(processDataInBatches.bind(placementUtilities))
        .then(placementUtilities.addNewUnitsToPlacement.bind(placementUtilities))
        .then(clearGamDataFolder)
        .catch((error) => {
            placementUtilities.updatePlacementsConfigInCouchbase(PLACEMENT_UPDATE_STATUS.FAIL);
            const emailBody = `<p>Error in running Ad units addition to placement service: ${error} </p>`;
	        const emailSubject = 'Ad units addition to placement service error';
            handleErrorAndSendMail({
                emailBody, 
                emailSubject,
                mailReceivers: supportMails
            });
        });
}

let cronJob = cron.schedule(cronSchedule.adUnitsPlacementAutomationService, main, false);
cronJob.start();