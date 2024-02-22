const GamApiUtilities = require('./GamApiUtilities');
const couchbaseService = require('../../../helpers/couchBaseService');

const {
    GAM_SERVICES: {
        SEARCH_PLACEMENT,
        UPDATE_PLACEMENT
    },
    PLACEMENT_NAME_PREFIX,
    MAX_UNITS_IN_PLACEMENT,
    PLACEMENT_STATE,
    PLACEMENT_UPDATE_STATUS,
    COUCHBASE_QUERIES
} = require('./constants');

class PlacementUtilities {
    constructor () {
        this.currentPlacement = null;
        this.gamApiUtilities = new GamApiUtilities();
        this.adUnitsAlreadyPresent = [];
    }

    /**
     * Function to return all the ad units which are currently added in all the placements
     * @returns {Array} the ad units which are already present in the placements
     */
    getAdUnitsAlreadyPresent () {
        return this.adUnitsAlreadyPresent;
    }

    /**
     * Function to store all the ad units which are currently added in all the placements
     * @param {Array} targetedAdUnitIds 
     */
    setAdUnitsAlreadyPresent (targetedAdUnitIds) {
        this.adUnitsAlreadyPresent.push(...targetedAdUnitIds);
    }

    /**
     * Function to search placements through the name provided
     * @param {String} placementName 
     * @returns {Promise <Array>} the response for the searched placement
     */
    getPlacementFromGam(placementName) {
        const url = this.gamApiUtilities.buildRequestUrl(SEARCH_PLACEMENT, placementName);
        return this.gamApiUtilities.makeGetRequest(url);
    }

    /**
     * Function to update placements
     * @param {Object} placementPayload 
     * @returns {Promise <Array>} the updated placement response
     */
    updatePlacementInGam(placementPayload) {
        const url = this.gamApiUtilities.buildRequestUrl(UPDATE_PLACEMENT);
        return this.gamApiUtilities.makePutRequest(url, placementPayload);
    }

    /**
     * Function to update current placement value in couchbase FP config
     * @param {String} updateStatus 
     * @returns {Promise} updates the current placement and returns the new set value
     */
    updatePlacementsConfigInCouchbase (updateStatus) {
        console.log(`\n--------------------- UPDATING CURRENT PLACEMENT IN CB ---------------------\n`);

        let updateQuery = COUCHBASE_QUERIES.UPDATE_PLACEMENT;

        const updatePayload = {
            name: this.currentPlacement && this.currentPlacement.name,
            id: this.currentPlacement && this.currentPlacement.id,
            lastRunStatus: updateStatus,
            lastRunTime: new Date().getTime()
        }

        updateQuery = updateQuery.replace('__CURRENT_PLACEMENT__', JSON.stringify(updatePayload));

        if(updateStatus === PLACEMENT_UPDATE_STATUS.FAIL) {
            updateQuery = COUCHBASE_QUERIES.UPDATE_PLACEMENT_STATUS
                .replace('__STATUS__', JSON.stringify(updateStatus))
                .replace('__LAST_RUN__', new Date().getTime());
        }

        return couchbaseService.queryFromAppBucket(updateQuery)
            .then(() => console.log("Current placement updated in couchbase"))
            .catch(error => { throw error });
    }

    /**
     * Function to set the current placement which has space to add new units
     * @param {Array} placements 
     */
    setNewCurrentPlacement(placements) {
        console.log(`\n--------------------- SETTING NEW CURRENT PLACEMENT ---------------------\n`);

        let currentPlacementSet = false;

        placements.forEach(placement => {
            const { name, id, targetedAdUnitIds, status } = placement;
            if(status.value !== PLACEMENT_STATE.ACTIVE) return; //Some placements could be archived or inactive so not using them
            if(targetedAdUnitIds.length < MAX_UNITS_IN_PLACEMENT && !currentPlacementSet) {
                this.currentPlacement = {
                    name,
                    id,
                    targetedAdUnitIds,
                    adUnitsPresent: targetedAdUnitIds.length
                };
                currentPlacementSet = true;
            }
            this.setAdUnitsAlreadyPresent(targetedAdUnitIds);
        });

        console.log(`Placement Name: ${this.currentPlacement.name}`);
        console.log(`Placement ID: ${this.currentPlacement.id}`);
        console.log(`Number Of Ad Units Present: ${this.currentPlacement.adUnitsPresent}`);
    }

    /**
     * Function to get all the placement from GAM with prefix as Banner_Placement and set the empty one as current placement
     */
    async fetchAndSaveNewPlacements () {
        try {
            const allPlacements = await this.getPlacementFromGam(PLACEMENT_NAME_PREFIX);

            if(!(allPlacements && allPlacements.length)) {
                return Promise.reject('No Placements Found!');
            }

            this.setNewCurrentPlacement(allPlacements);
        } catch (error) {
            Promise.reject(error);
        }
    }

    /**
     * Function to update the ad units in the GAM placement
     * @param {Array} unitsToAdd 
     */
    async updateUnitsInPlacement(unitsToAdd) {
        console.log(`\n--------------------- UPDATING PLACEMENT IN GAM ---------------------\n`);

        if(!this.currentPlacement) {
            console.log(`\nNo current placement found! Returning`);
            return Promise.reject('No current placement found! Returning');
        }

        let updatePayload = [{
            targetedAdUnitIds: unitsToAdd,
            id: this.currentPlacement.id,
            name: this.currentPlacement.name
        }];

        console.log(`Placement Name: ${this.currentPlacement.name}`);
        console.log(`Placement ID: ${this.currentPlacement.id}`);
        console.log(`Number Of Ad Units Present: ${this.currentPlacement.adUnitsPresent}`);
        console.log(`Number Of Ad Units Being Added: ${unitsToAdd.length}`);

        await this.updatePlacementInGam(updatePayload);
        await this.updatePlacementsConfigInCouchbase(PLACEMENT_UPDATE_STATUS.COMPLETED);

        this.currentPlacement = null; //Resetting currentPlacement as it will be set again for new one
    }

    /**
     * Function to add the new units to the placements
     * @param {Array} unitsToAdd 
     */
    async addNewUnitsToPlacement (unitsToAdd) {
        if(!unitsToAdd.length) {
            console.log("\nNo new units to add! Returning");
            return this.updatePlacementsConfigInCouchbase(PLACEMENT_UPDATE_STATUS.COMPLETED);
        }

        let totalAdUnits = [...this.currentPlacement.targetedAdUnitIds, ...unitsToAdd];

        let unitsWhichCanBeAdded = totalAdUnits.slice(0, MAX_UNITS_IN_PLACEMENT);
        let leftOverUnits = totalAdUnits.slice(MAX_UNITS_IN_PLACEMENT, totalAdUnits.length);

        await this.updateUnitsInPlacement(unitsWhichCanBeAdded);

        if(!leftOverUnits.length) {
            console.log("\nAll new units have been added to the placements");
            return;
        }

        console.log("\nFetching new placement, as max limit reached");
        await this.fetchAndSaveNewPlacements();
        await this.addNewUnitsToPlacement(leftOverUnits);
    }
}

module.exports = PlacementUtilities;