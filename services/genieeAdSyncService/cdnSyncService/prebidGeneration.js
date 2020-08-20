const Promise = require('bluebird');
const { exec } = require('child_process');
const path = require('path');

const prebidDir = path.join(__dirname, '../', 'adpushup.js', 'modules', 'adpTags', 'Prebid.js');

function init(prebidAdapters) {
	return new Promise((resolve, reject) => {
		exec(
			`gulp build --modules=${prebidAdapters}`,
			{ cwd: prebidDir },
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
