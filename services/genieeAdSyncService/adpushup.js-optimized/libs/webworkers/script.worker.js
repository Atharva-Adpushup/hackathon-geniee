function init(data) {
	for (const key in data) {
		if (data.hasOwnProperty(key)) {
			// console.log(`current ${self[key]}`, `setting self.${key}`, data[key]);
			console.log()
			self[key] = data[key];
		}
	}
}

function detectPlatform({ userAgent }) {
	const MobileDetect = require('mobile-detect');

	const md = new MobileDetect(userAgent);

	try {
		if (md.phone()) {
			postMessage('MOBILE');
		} else if (md.tablet()) {
			postMessage('TABLET');
		} else {
			postMessage('DESKTOP');
		}
	} catch (e) {
		// TODO: handle error
	} // eslint-disable-line no-empty
}

self.addEventListener('message', ({ data: { type, data } }) => {
	switch (type) {
		case 'init':
			init(data);
			break;

		case 'detect-platform':
		default:
			detectPlatform(data);
	}
});

// -------------------------------------------------

// var MobileDetect = require('mobile-detect');

// onmessage = function({ data: { userAgent } }) {
// 	var md = new MobileDetect(userAgent);
// 	try {
// 		if (md.phone()) {
// 			postMessage('MOBILE');
// 		} else if (md.tablet()) {
// 			postMessage('TABLET');
// 		} else {
// 			postMessage('DESKTOP');
// 		}
// 	} catch (e) {} // eslint-disable-line no-empty
// };
