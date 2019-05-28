// Custom build script for generating AdPushup Header Bidding scripts

const fs = require('fs'),
	path = require('path'),
	inventories = fs.readdirSync('./hbScript/inventory'),
	webpack = require('webpack');

let fileList = [];

for (let i in inventories) {
	if (path.extname(inventories[i]) === '.json') {
		fileList.push(inventories[i]);
		console.log(`Generating build for ${inventories[i]}`);
	}
}

const createFinalBuild = (contents, file) => {
	const filePath = `./hbScript/build/${file}`;

	fs.writeFile(filePath, contents, function(err) {
		if (err) {
			console.log('Error writing file: ' + err);
		}
		console.log(`Final build generated - ${file}`);
	});
};

const replaceFileContents = (siteId, inventory) =>
	fs
		.readFileSync(`./hbScript/build/${siteId}.min.js`)
		.toString()
		.replace('__SITE_ID__', siteId)
		.replace('__INVENTORY__', inventory);

const generateBuild = file => {
	const siteId = file.split('.')[0],
		fileName = `${siteId}.min.js`;

	webpack(
		{
			entry: {
				adpushupHB: path.join(__dirname, 'hbScript', 'index.js')
			},
			output: {
				path: path.join(__dirname, 'hbScript', 'build'),
				filename: fileName
			},
			plugins: [
				new webpack.optimize.UglifyJsPlugin({
					compress: {
						warnings: false
					},
					mangle: false,
					sourceMap: true
				})
			]
		},
		(err, stats) => {
			if (err) {
				console.log(err);
			}
			const inventory = fs
				.readFileSync(`./hbScript/inventory/${file}`)
				.toString()
				.replace(/\s/g, '');

			updatedBuild = replaceFileContents(siteId, inventory);
			createFinalBuild(updatedBuild, fileName);
		}
	);
};

for (let i in fileList) {
	generateBuild(fileList[i]);
}
