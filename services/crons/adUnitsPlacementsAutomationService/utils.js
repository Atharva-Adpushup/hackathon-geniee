const axios = require('axios');
const path = require('path');
const fs = require('fs');
const csv = require('csvtojson');
const zlib = require('zlib');

const {
	DEFAULT_MINIMUM_AD_CODE_SERVED_COUNT,
	GAM_FOLDER_NAME,
	DOWNLOAD_RESPONSE_TYPE
} = require('./constants');

/**
 * Function to create a new directory for the name provided if not already present
 * @returns {Promise} resolve if directory created or already present. Reject in case of error
 */
function initializeGamDataFolder() {
	return new Promise((resolve, reject) => {
		let directoryPath = path.join(__dirname, GAM_FOLDER_NAME);

		fs.access(directoryPath, fs.constants.F_OK, (error) => {
			// To check if the given directory already exists or not 
			if (error) {
				// If current directory does not exist, then create it 
				fs.mkdir(directoryPath, (error) => {
					if (error) {
						reject(error);
					} else {
						resolve();
					}
				});
			} else {
				resolve();
			}
		});
	});
}

/**
 * Function to delete a particular directory
 * @returns {Promise} resolve if directory deleted. Reject in case of error
 */
function clearGamDataFolder() {
	let directoryPath = path.join(__dirname, GAM_FOLDER_NAME);
	return new Promise((resolve, reject) => {
		try {
			fs.rm(directoryPath, { recursive: true }, (error) => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * Function to json data from the csv file
 * @param {String} filePath 
 * @returns {Promise <Object>} data in json format
 */
function getRawDataByFilePath(filePath) {
	return csv().fromFile(filePath);
}

/**
 * Function to download file for url provided
 * @param {String} url 
 * @param {String} filePath 
 * @returns {Promise} resolve in case the data is downloaded else reject
 */
function downloadFile(url, filePath) {
	const file = fs.createWriteStream(filePath);
	const streamConfig = { responseType: DOWNLOAD_RESPONSE_TYPE };

	return new Promise(function (resolve, reject) {
		axios.get(url, streamConfig)
			.then(response => {
				response.data.pipe(zlib.createGunzip()).pipe(file);
				response.data.on('end', () => resolve(filePath));
			})
			.catch(error => reject(error));
	});
}

/**
 * Function to check if an ad unit is valid or not, meaning remove replace GPT or undefined units
 * @param {String} adUnit 
 * @returns {Boolean} true if all the conditions are met
 */
function isValidAdUnit(adUnit) {
	/**
	 * Check if unit is not of replace gpt tag
	 * Regex doesnot match -> /.*_\d+$/
	 */
	try {
		if (!adUnit) {
			return false;
		}
		return !adUnit.match(/.*_\d+$/);
	} catch (e) {
		return false;
	}
}

/**
 * Function to get ad unit ids from the raw ad unit data
 * @param {Object} getAdUnitIds 
 * @returns {Array} eligible ad unit ids
 */
function getAdUnitIds(rawData) {
	const adUnitIds = rawData
		.map((rawDataRow) => {
			const { Dimension = {}, Column = {} } = rawDataRow || {};
			const adUnitName = Dimension.AD_UNIT_NAME;
			const adUnitId = Dimension.AD_UNIT_ID;
			if (+Column.TOTAL_CODE_SERVED_COUNT > DEFAULT_MINIMUM_AD_CODE_SERVED_COUNT) {
				return {adUnitName, adUnitId};
			}
		})
		.filter(adUnit => isValidAdUnit(adUnit.adUnitName))
		.map(adUnit => adUnit.adUnitId)

	return adUnitIds;
}

module.exports = {
	initializeGamDataFolder,
	clearGamDataFolder,
	getRawDataByFilePath,
	downloadFile,
	getAdUnitIds
};