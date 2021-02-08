const imageConversionModule = require('base64-img'),
	Promise = require('bluebird'),
	_ = require('lodash');

function convertAllBase64ToImages(collection) {
	return Promise.all(
		_.map(collection, imageObject => {
			return new Promise((resolve, reject) => {
				imageConversionModule.img(imageObject.data, imageObject.path, imageObject.name, function(
					err,
					filePath
				) {
					if (err) {
						return reject(err);
					}

					const resultObject = {
						path: `${filePath}`,
						cid: `${imageObject.name}-img`,
						name: `${imageObject.name}`
					};

					return resolve(resultObject);
				});
			}).catch(err => false);
		})
	);
}

function init(collection) {
	return convertAllBase64ToImages(collection)
		.then(imageCollection => {
			const filePaths = imageCollection
				.reduce((array, itemObject) => {
					array.push(itemObject.name);
					return array;
				}, [])
				.join(', ');

			console.log(`Successfully converted all images: ${filePaths}`);
			return imageCollection;
		})
		.catch(err => {
			console.log(`Error while converting images: ${err.message}`);
			return false;
		});
}

module.exports = {
	init: init
};
