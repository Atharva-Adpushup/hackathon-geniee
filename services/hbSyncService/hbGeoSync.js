var Promise = require('bluebird'),
    url = require('url'),
    retry = require('bluebird-retry'),

    fs = Promise.promisifyAll(require('fs')),
    mkdirpAsync = Promise.promisifyAll(require('mkdirp')).mkdirpAsync,

    readFileAsync = Promise.promisify(require("fs").readFile);
    couchbase = require('../../helpers/couchBaseService');

function constructHBJsFile(jsContents, indiHbConfig, siteData){
	var hostname = url.parse(siteData.siteDomain).hostname,
		domainNames = [ hostname ];

	if( ! hostname.match('^www.') ) {
		domainNames.push('www.' + hostname);
	}

	jsContent = jsContents
		.replace('__HB_SITE_ID__', siteData.siteId)
		.replace('__HB_SITE_DOMAINS__', JSON.stringify(domainNames) )
		.replace('__HB_BIDDING_PARTNERS__', JSON.stringify(indiHbConfig.info) )
		.replace('__HB_PREBID_TIMEOUT__', indiHbConfig.pbTimeout || 5000);

	if( indiHbConfig.targetAllDFP ) {
		jsContent = jsContents.replace('__HB_TARGET_ALL_DFP__', indiHbConfig.targetAllDFP || false);
	} else {
		jsContent = jsContents.replace('__HB_AD_UNIT_TARGETING__', JSON.stringify(indiHbConfig.adUnitTargeting || {
			"networkId"        : indiHbConfig.networkId || 103512698,
			"adUnits"          : indiHbConfig.adUnits || {},
			"targetAllAdUnits" : indiHbConfig.targetAllAdUnits || false,
		}) );
	}

	return jsContent;

}

module.exports = function (siteId) {
    var jsTplPath = path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'adpushupHB.js'),
			hbRootPath = path.join('/adpushup', 'hb_files', siteId.toString());

		couchbase
			.connectToAppBucket()
	    .then(function(appBucket) {
	        return Promise.join([
	        	appBucket.getAsync('hbcf::' + siteId, {}),
						readFileAsync(jsTplPath),
	        	mkdirpAsync(hbRootPath)
	        ]);
	    })
		  .spread(function(siteData, jsContents){
	    	jsContents = jsContents.toString();
    		return Promise.all( siteData.hbConfig.map(function( indiHbConfig ){

    			if( indiHbConfig.type === "all" ) {
          	return fs.writeFileAsync(
          		path.join(hbRootPath, 'adpushup.GLOBAL.js'),
          		constructHBJsFile(jsContents, indiHbConfig, siteData)
          	);
          } else if ( indiHbConfig.type === "continent" ) {
          	return fs.writeFileAsync(
          		path.join(hbRootPath, 'adpushup.' + indiHbConfig.continent + '.js'),
          		constructHBJsFile(jsContents, indiHbConfig, siteData)
          	);
          } else {
          	return fs.writeFileAsync(
          		path.join(hbRootPath, 'adpushup.' + indiHbConfig.country + '.js'),
          		constructHBJsFile(jsContents, indiHbConfig, siteData)
          	);
          }
    		}) );
    	}).catch(function(e){
    		console.log(e);
    	});
};