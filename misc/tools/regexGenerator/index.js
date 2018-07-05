const urlModule = require('url'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	{ promiseForeach } = require('node-utils'),
	generateUrlRegex = require('./generateUrlRegex');

function errorHandler(data, err) {
	return false;
}

function sendError(type, message) {
	return new Error(
		JSON.stringify({
			type,
			message
		})
	);
}

function getParsedUrls(urls) {
	if (!Array.isArray(urls) || !urls.length) {
		return Promise.resolve([]);
	}
	const parsedUrls = _.map(urls, url => {
		return urlModule.parse(url);
	});
	return Promise.resolve(parsedUrls);
}

function getProtocols(protocol, urlParts) {
	if (protocol) {
		urlParts.protocols.values.indexOf(protocol) == -1 ? urlParts.protocols.values.push(protocol) : null;
	} else {
		urlParts.protocols.isOptional = true;
	}
	return Promise.resolve();
}

function getDomains(domain, urlParts) {
	if (!domain) {
		return Promise.reject(sendError(1, 'Protocol/Domain missing in one of the input urls'));
	} else if (!urlParts.domains.length) {
		urlParts.domains.push(domain);
	} else if (urlParts.domains.indexOf(domain) == -1) {
		return Promise.reject(sendError(1, 'All urls must have same domain'));
	}
	return Promise.resolve();
}

function getPaths(path, urlParts) {
	if (path && path != '/') {
		const firstCharacter = path.substring(0, 1),
			lastCharacter = path.substring(path.length - 1, path.length);

		firstCharacter == '/' ? (path = path.substring(1, path.length)) : null;
		lastCharacter == '/' ? (path = path.substring(0, path.length - 1)) : null;

		pathParts = _.split(path, '/');

		if (!urlParts.paths.all.length) {
			urlParts.paths.all = _.concat(urlParts.paths.all, pathParts);
		} else if (pathParts.length != urlParts.paths.all.length) {
			return sendError(1, 'All urls must have same path structure');
		} else {
			_.forEach(pathParts, part => {
				const elementIndex = urlParts.paths.all.indexOf(part);
				if (elementIndex != -1) {
					urlParts.paths.common[part] = {
						value: part,
						count: urlParts.paths.common[part] ? urlParts.paths.common[part].count + 1 : 2,
						index: elementIndex
					};
				}
			});
		}
		_.forEach(pathParts, (value, index) => {
			urlParts.paths.partsByPosition[index] = urlParts.paths.partsByPosition[index] || [];
			urlParts.paths.partsByPosition[index].push(value);
		});
	}
	return Promise.resolve();
}

function getQueries(query, urlParts) {
	query ? urlParts.queries.push(query) : null;
	return Promise.resolve();
}

function getHashes(hash, urlParts) {
	hash ? urlParts.hashes.push(hash) : null;
	return Promise.resolve();
}

function segregateParts(urlParts, url) {
	return getProtocols(url.protocol, urlParts)
		.then(() => getDomains(url.hostname, urlParts))
		.then(() => getPaths(url.pathname, urlParts))
		.then(() => getQueries(url.query, urlParts))
		.then(() => getHashes(url.hash, urlParts));
}

function processUrls(input) {
	let matchUrlParts = {
			protocols: {
				values: [],
				isOptional: false
			},
			domains: [],
			paths: {
				common: {},
				all: [],
				partsByPosition: {}
			},
			queries: [],
			hashes: []
		},
		notMatchUrlParts = {
			protocols: {
				values: [],
				isOptional: false
			},
			domains: [],
			paths: {
				common: {},
				all: [],
				partsByPosition: {}
			},
			queries: [],
			hashes: []
		},
		toNotMatchExists = input.toNotMatch && input.toNotMatch.length ? true : false,
		toNotMatchLength = toNotMatchExists ? input.toNotMatch.length : false;

	return promiseForeach(input.toMatch, segregateParts.bind(null, matchUrlParts), errorHandler)
		.then(() => {
			return toNotMatchExists
				? promiseForeach(input.toNotMatch, segregateParts.bind(null, notMatchUrlParts), errorHandler)
				: true;
		})
		.then(() => generateUrlRegex(input.toMatch.length, matchUrlParts, toNotMatchLength, notMatchUrlParts))
		.catch(error => {
			console.log(error);
			let message = error.message;
			if (!message) {
				let err = error[0] && error[0].message ? error[0].message : false;
				err = err ? JSON.parse(err) : false;
				message = err && err.type == 1 ? err.message : 'Something went wrong!';
			}
			return Promise.reject({
				error: true,
				message: message
			});
		});
}

function init(input) {
	return Promise.join(getParsedUrls(input.toMatch), getParsedUrls(input.toNotMatch), (toMatch, toNotMatch) => {
		const dataToSend = {
			toMatch,
			toNotMatch
		};
		return processUrls(dataToSend)
			.then(response => {
				return {
					error: false,
					regex: response
				};
			})
			.catch(err => {
				return { ...err };
			});
	});
}

module.exports = init;

// init({
// 	toMatch: [
// 		'http://www.learncbse.in/hc-verma-solutions/',
// 		'http://www.learncbse.in/rd-sharma-class-9th-solutions/',
// 		'http://www.learncbse.in/rd-sharma-class-8-solutions/'
// 	],
// 	// toMatch: [
// 	// 	'http://www.rentdigs.com/pet-friendly/abc/pet-rentals.aspx?StateCD=CA',
// 	// 	'http://www.rentdigs.com/pet-friendly/xyz/states.aspx?Ad=G_RDC_HFR_SLE',
// 	// 	'http://www.rentdigs.com/pet-friendly/cvb/states.aspx'
// 	// ],
// 	toNotMatch: []
// 	// toNotMatch: [
// 	// 	'http://www.rentdigs.com/new-york/rty/newyorkstate.aspx',
// 	// 	'http://www.rentdigs.com/new-york/rty/newyorkstate.aspx',
// 	// 	'http://www.rentdigs.com/north-carolina/rty/greensboro-apartments.aspx'
// 	// ]
// });
