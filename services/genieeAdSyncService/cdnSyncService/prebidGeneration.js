const Promise = require('bluebird');
const { exec } = require('child_process');
const path = require('path');

const prebidDir = path.join(__dirname, '../', 'adpushup.js', 'modules', 'adpTags', 'Prebid-latest');

function init(generatedConfig) {
	return new Promise((resolve, reject) => {
		const { statusesAndAds: { statuses = {}, config = {} } = {} } = generatedConfig;
		if (!statuses.HB_ACTIVE) {
			return resolve(generatedConfig);
		}
		exec(`gulp build --modules=${config.prebidAdapters}`, { cwd: prebidDir }, (e, stdout, stderr) => {
			if (e instanceof Error) {
				return reject(e);
			}
			console.log('Output from child process ', stdout);
			return resolve(generatedConfig);
		});
	});
}

module.exports = init;
