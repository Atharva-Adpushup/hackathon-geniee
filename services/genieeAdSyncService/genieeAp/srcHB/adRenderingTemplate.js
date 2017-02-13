module.exports = "<html>" +
		"<head>" +
			"<script>" +
				"var head = document.getElementsByTagName('head')[0];" +

				"var pbjs = pbjs || {};" +
				"pbjs.que = pbjs.que || [];" +

				"var PREBID_TIMEOUT = __PB_TIMEOUT__;" +
				"var SLOT_ID = __PB_SLOT_ID__;" +
				"var CONTAINER_ID = __PB_CONTAINER_ID__;" +

				"var prebidScript = document.createElement('script');" +
				"prebidScript.async = true;" +
				"prebidScript.text = 'var adpPrebid = ' + parent.adpPrebid.toString() + ';';" +
				"head.appendChild(prebidScript);" +

				"adpPrebid(); parent.pbBidAdjustments.set(pbjs);" +

				"var original = document.createElement;" +
        "document.createElement = function (tag) {" +
        	"if ( tag.toLowerCase() === 'script' ) { " +
	        	"tag = '__script';" +
	        	"parent.__createScriptInParent([].slice.call(document.getElementsByTagName('__script')), SLOT_ID);" +
	        "}" +
        	"return original.call(document, tag);" +
        "};" +

				"function serverRenderCode( timeout ){" +
					"if( serverRenderCode.isExecuted === undefined ) {" +
						"serverRenderCode.isExecuted = true;" +

						"var pbjsParams = {" +
							"'_bidsReceived'  : pbjs._bidsReceived," +
							"'_bidsRequested' : pbjs._bidsRequested," +
							"'_adUnitCodes'   : pbjs._adUnitCodes," +
							"'_winningBids'   : pbjs._winningBids," +
							"'_adsReceived'   : pbjs._adsReceived" +
						"};" +
						"if( Number.isInteger(timeout) ) {" +
							"parent.__renderPrebidAd(pbjsParams, SLOT_ID, CONTAINER_ID, timeout);" +
						"} else {" +
							"parent.__renderPrebidAd(pbjsParams, SLOT_ID, CONTAINER_ID);" +
						"}" +

					"}" +
				"}" +

				"setTimeout(function(){" +
					"serverRenderCode(PREBID_TIMEOUT);" +
				"}, PREBID_TIMEOUT);" +

				"pbjs.que.push(function(){" +
					"pbjs.setPriceGranularity('dense');" +
					"pbjs.addAdUnits(__AD_UNIT_CODE__);" +

					"pbjs.requestBids({" +
						"timeout : PREBID_TIMEOUT," +
						"bidsBackHandler: serverRenderCode" +
					"});" +
				"})" +

			"</script>" +
		"</head>" +
		"<body></body>" +
	"</html>";