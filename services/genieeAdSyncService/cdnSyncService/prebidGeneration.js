const Promise = require('bluebird');
const { exec } = require('child_process');
const path = require('path');

const defaultDir = path.join(__dirname, '../', 'adpushup.js', 'modules', 'adpTags', 'Prebid.js');
const optimizedAdpushupDir = path.join(
	__dirname,
	'../',
	'adpushup.js-optimized',
	'modules',
	'adpTags',
	'Prebid.js'
);

function init(prebidAdapters, isAdhocOptimizationEnabled) {
	const prebidDirectory = !!isAdhocOptimizationEnabled ? optimizedAdpushupDir : defaultDir;

	return new Promise((resolve, reject) => {
		exec(
			`gulp build --modules=${prebidAdapters}`,
			{ cwd: prebidDirectory },
			(e, stdout, stderr) => {
				if (e instanceof Error) {
					return reject(e);
				}
				console.log('Output from child process ', stdout);
				return resolve(true);
			}
		);
	});
}

module.exports = init;
