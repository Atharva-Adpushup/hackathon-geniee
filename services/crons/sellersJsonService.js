const fs = require('fs');
const md5 = require('md5');
const path = require('path');
const moment = require('moment');
const validator = require('validator');
const couchbase = require('couchbase');
const _findIndex = require('lodash/findIndex');

const userModel = require('../../models/userModel');
const commonConsts = require('../../configs/commonConsts');
const { domanize, rightTrim } = require('../../helpers/utils');
const couchbaseService = require('../../helpers/couchBaseService');
const globalBucketLogger = require('../../helpers/globalBucketLogger');

const fileDirectory = path.resolve(__dirname, '../../', 'public');

const filenames = {
	new: path.resolve(fileDirectory, 'latest_sellers.json'),
	default: path.resolve(fileDirectory, 'sellers.json'),
	backup: path.resolve(fileDirectory, `bkp_sellers.json`)
};

const SELLER_TYPE = 'PUBLISHER';
const APP_BUCKET = 'AppBucket';
const AP_APP_BUCKET = 'apAppBucket';
const NEW_USER_AGE_IN_MONTHS = 3;
const LAST_PAYMENT_CHECK_EXPIRY = 5;

let errors = [];

let confidentialDomainValidator = {
	'media.net': function(domain) {
		return domain.indexOf('media.net') === 0;
	}
};
let confidentialEmails = ['@media.net'];
let confidentialCompanyNames = ['media.net'];
let ignoredEmails = ['@mailinator', '@adpushup'];

let fileOutput = commonConsts.SELLERS_JSON.fileConfig;

function getUsersQueryForBucket(bucketName) {
	let queryString = `SELECT email, sellerId, dateCreated, manuallyEnteredCompanyName, lastPaymentCheckDateSellersJson, ARRAY site.domain FOR site IN sites END AS siteDomains FROM ${bucketName} WHERE meta().id LIKE 'user::%' AND ARRAY_LENGTH(sites) > 0;`;
	return couchbase.N1qlQuery.fromString(queryString);
}

function colorLog(color, ...messages) {
	let colors = {
		red: '\x1b[31m',
		green: '\x1b[32m',
		yellow: '\x1b[33m',
		blue: '\x1b[34m',
		magenta: '\x1b[35m',
		cyan: '\x1b[36m'
	};
	console.log(colors[color] + ' \033[1m', ...messages);
}

function isIgnoredEmail(email) {
	return ignoredEmails.some(ignoredEmail => !!email.toLowerCase().includes(ignoredEmail));
}

function isConfidentialDomain(domain) {
	for (confidentialDomain in confidentialDomainValidator) {
		if (
			domain.toLowerCase().includes(confidentialDomain) &&
			confidentialDomainValidator[confidentialDomain](domain)
		) {
			return true;
		}
	}
	return false;
}

function isConfidentialEmail(email) {
	return confidentialEmails.some(
		confidentialEmail => !!email.toLowerCase().includes(confidentialEmail)
	);
}

function isConfidentialCompanyName(companyName) {
	return confidentialCompanyNames.some(
		confidentialCompanyName => !!companyName.toLowerCase().includes(confidentialCompanyName)
	);
}

function getUsersWithNonEmptySites() {
	const appBucketUsersQuery = couchbaseService.connectToAppBucket().then(function(appBucket) {
		return appBucket.queryAsync(getUsersQueryForBucket(APP_BUCKET));
	});
	const apAppBucketUsersQuery = couchbaseService
		.connectToBucket(AP_APP_BUCKET)
		.then(function(apAppBucket) {
			return apAppBucket.queryAsync(getUsersQueryForBucket(AP_APP_BUCKET));
		});
	return Promise.all([appBucketUsersQuery, apAppBucketUsersQuery]).then(formatAndFilterUsers);
}

function formatAndFilterUsers(users) {
	let [appBucketUsers, apAppBucketUsers] = users;
	colorLog(
		'cyan',
		`Total Users in the Buckets: ${appBucketUsers.length + apAppBucketUsers.length}`
	);

	appBucketUsers = appBucketUsers.reduce(function(output, user) {
		if (!validator.isEmail(user.email) || isIgnoredEmail(user.email)) {
			return output;
		}
		user.bucket = [APP_BUCKET];
		user.siteDomain = user.siteDomains[0];
		user.hasConfidentialDomain = user.siteDomains.some(domain =>
			isConfidentialDomain(domanize(domain))
		);
		output.push(user);

		delete user.siteDomains;
		return output;
	}, []);

	apAppBucketUsers = apAppBucketUsers.reduce(function(output, user) {
		if (!validator.isEmail(user.email) || isIgnoredEmail(user.email)) {
			return output;
		}
		let userIndex = _findIndex(appBucketUsers, { email: user.email });

		if (userIndex !== -1) {
			appBucketUsers[userIndex].bucket.push(AP_APP_BUCKET);
		} else {
			user.bucket = [AP_APP_BUCKET];
			user.siteDomain = user.siteDomains[0];
			user.hasConfidentialDomain = user.siteDomains.some(domain =>
				isConfidentialDomain(domanize(domain))
			);
			output.push(user);
		}

		delete user.siteDomains;
		return output;
	}, []);

	colorLog('cyan', `Total Unique Users: ${appBucketUsers.length + apAppBucketUsers.length}`);

	return appBucketUsers.concat(apAppBucketUsers);
}

function createSellerId(email) {
	return md5(email.toLowerCase());
}

function getPreparedSiteObj(user) {
	let siteObj = {};
	let isConfidential =
		user.hasConfidentialDomain ||
		isConfidentialEmail(user.email) ||
		isConfidentialCompanyName(user.companyName);

	if (!isConfidential) {
		siteObj.name = user.companyName;
		siteObj.domain = domanize(user.siteDomain);
	}

	siteObj.seller_id = user.sellerId;
	siteObj.seller_type = SELLER_TYPE;
	siteObj.is_confidential = isConfidential ? 1 : 0;

	return siteObj;
}

function userPaidInPastFiveMonths(email) {
	const from = moment()
		.subtract(5, 'months')
		.startOf('day')
		.unix();
	const to = moment().unix();

	return userModel.getUserPaymentDetailsForRangeFromTipalti(email, from, to).then(function(data) {
		return data.submittedTotal && data.submittedTotal > 0;
	});
}

function getUserCompanyName(email) {
	return userModel.getUserBasicDetailsFromTipalti(email).then(function(data) {
		return data.CompanyName || data.Name || false;
	});
}

function updateUser(user, data) {
	if (Object.keys(data).length === 0) {
		return Promise.resolve();
	}
	// user exists in both the buckets, update the docs in both the buckets
	if (user.bucket.length === 2) {
		const apAppBucketUpdate = updateApAppBucketUser(user, data);
		const appBucketUpdate = userModel.updateUserData(user.email, data);

		return Promise.all([apAppBucketUpdate, appBucketUpdate]);
	}

	if (user.bucket.includes(APP_BUCKET)) {
		return userModel.updateUserData(user.email, data);
	}

	return updateApAppBucketUser(user, data);
}

function updateApAppBucketUser(user, data) {
	let queryString = `UPDATE ${AP_APP_BUCKET} USE KEYS 'user::${user.email}' SET`;
	for (key in data) {
		const value = typeof data[key] === 'string' ? `"${data[key].replace(/"/g, "'")}"` : data[key];
		queryString += ` ${key} = ${value},`;
	}
	queryString = `${rightTrim(queryString, ',')}`;

	const query = couchbase.N1qlQuery.fromString(queryString);
	return couchbaseService.connectToBucket(AP_APP_BUCKET).then(function(bucket) {
		bucket.queryAsync(query);
	});
}

function writeDataToTempFile() {
	return new Promise(function(resolve, reject) {
		if (fs.existsSync(filenames.new)) {
			fs.unlinkSync(filenames.new);
		}
		fs.writeFile(filenames.new, JSON.stringify(fileOutput), function(error) {
			if (error) {
				colorLog('red', '\nERROR WHILE STARTING WRITE DATA\n', error);
				if (fs.existsSync(filenames.new)) {
					fs.unlinkSync(filenames.new);
				}
				return reject(`FAILED TO WRITE THE FILE: ${error.message}`);
			}
			return resolve();
		});
	});
}

function replaceWithOldSellersJson() {
	if (errors.length) {
		console.log(errors);
		throw new Error(
			'Due to non-empty errors not updating the sellers.json file with this new one created. You may check the latest_sellers.json file created to get help for errors'
		);
	}
	const newFilename = filenames.new;
	const backupFilename = filenames.backup;
	const defaultFilename = filenames.default;

	function renameNewFileToDefault() {
		return new Promise(function(resolve, reject) {
			fs.rename(newFilename, defaultFilename, function(error) {
				if (error) {
					// rename the last file to be the latest
					fs.renameSync(backupFilename, defaultFilename);
					return reject(`FAILED TO RENAME LATEST FILE: ${error.message}`);
				}
				return resolve();
			});
		});
	}

	return new Promise(function(resolve, reject) {
		let newFileExists = fs.existsSync(newFilename);

		if (!newFileExists) {
			return reject('NEW FILE NOT FOUND');
		}

		let defaultFileExists = fs.existsSync(defaultFilename);
		if (!defaultFileExists) {
			return renameNewFileToDefault().then(resolve);
		}

		// remove previous backup file
		let backupFileExists = fs.existsSync(backupFilename);
		if (backupFileExists) {
			fs.unlinkSync(backupFilename);
		}

		// rename current/default file to backup
		return fs.rename(defaultFilename, backupFilename, function(error) {
			if (error) {
				return reject(`FAILED TO RENAME CURRENT FILE: ${error.message}`);
			}
			renameNewFileToDefault().then(resolve);
		});
	});
}

function shouldUserBeAdded(user) {
	if (user.dateCreated && moment().diff(user.dateCreated, 'months') <= NEW_USER_AGE_IN_MONTHS) {
		return Promise.resolve();
	}

	if (
		user.lastPaymentCheckDateSellersJson &&
		moment().diff(user.lastPaymentCheckDateSellersJson, 'months') < LAST_PAYMENT_CHECK_EXPIRY
	) {
		return Promise.resolve();
	}

	return userPaidInPastFiveMonths(user.email).then(function(paid) {
		if (paid) {
			return paid;
		}

		return Promise.reject({ skipUser: true });
	});
}

function processDataInChunks(users, chunkSize = 500) {
	let chunkPromises = [];
	let usersChunk = users.splice(0, chunkSize);

	while (usersChunk.length > 0) {
		let user = usersChunk.pop();

		const userUpdates = {};
		const pendingPromises = [];

		if (!user.sellerId) {
			let sellerId = createSellerId(user.email);
			let updateSellerIdPromise = updateUser(user, { sellerId });
			pendingPromises.push(updateSellerIdPromise);
			user.sellerId = sellerId;
		}

		/*
			-	if tipalti does not have companyName, check for 'manuallyEnteredCompanyName' in the user doc
			-	if 'manuallyEnteredCompanyName' is not present do the following
					1.	save the 'manuallyEnteredCompanyName' in user doc with value user.siteDomain
					2.	use 'manuallyEnteredCompanyName' as the companyName
					3.	next time this process will be ignored since we would already have 'manuallyEnteredCompanyName' set
		*/
		let getCompanyNamePromise = getUserCompanyName(user.email).then(function(companyName) {
			if (companyName) {
				userUpdates.companyName = companyName;
				user.companyName = companyName;
			} else if (user.manuallyEnteredCompanyName) {
				user.companyName = user.manuallyEnteredCompanyName;
			}
		});
		pendingPromises.push(getCompanyNamePromise);

		let userProcessingPromise = new Promise(function(resolve, reject) {
			return Promise.all(pendingPromises)
				.then(function() {
					if (!user.companyName) {
						// if code reaches here, it means neither we have companyName in tipalti nor manuallyEnteredCompanyName in user
						user.companyName = userUpdates.manuallyEnteredCompanyName = domanize(user.siteDomain);
					}
					return shouldUserBeAdded(user).then(function(paidInPastFiveMonths) {
						if (paidInPastFiveMonths) {
							userUpdates.lastPaymentCheckDateSellersJson = new Date().getTime();
						}

						return updateUser(user, userUpdates);
					});
				})
				.then(function() {
					let siteObj = getPreparedSiteObj(user);
					fileOutput.sellers.push(siteObj);
					return resolve();
				})
				.catch(function(error) {
					if (error.skipUser) {
						return resolve();
					}
					colorLog('red', 'ERROR:', error);
					reject('FAILED DURING GETTING COMPANY NAME OR SETTING USER DATA: ' + error.message);
				});
		});

		chunkPromises.push(userProcessingPromise);
	}

	return Promise.all(chunkPromises).then(function() {
		colorLog('magenta', `Chunk processed! Users left: ${users.length}`);
		colorLog('blue', '================ memory usage ==================');
		colorLog(
			'blue',
			`Total: ${process.memoryUsage().heapTotal / 1024 / 1024}`,
			`Used: ${process.memoryUsage().heapUsed / 1024 / 1024}`
		);
		if (users.length > 0) {
			return processDataInChunks(users, chunkSize);
		}
		return;
	});
}

function handleError(error) {
	errors.push(error);
	console.log('\n' + error + '\n');
}

function reportErrors() {
	if (errors.length) {
		globalBucketLogger({
			source: 'CRON - SELLERS.JSON (sellersJsonService)',
			message: 'Error occured while running CRON for creating sellers.json',
			details: `${JSON.stringify(errors)}`
		});
	}
}

function init() {
	return getUsersWithNonEmptySites()
		.then(processDataInChunks)
		.then(writeDataToTempFile)
		.then(replaceWithOldSellersJson)
		.then(function() {
			colorLog('blue', '\nFINISHED\n');
			console.log({ errors });
		})
		.then(reportErrors)
		.catch(function(error) {
			handleError(error);
			reportErrors();
		});
}

process.on('unhandledRejection', function(reason) {
	colorLog('red', 'UNHANDLED REJECTION', reason);
	handleError(reason);
});

try {
	init();
} catch (error) {
	handleError(error);
	reportErrors();
}
