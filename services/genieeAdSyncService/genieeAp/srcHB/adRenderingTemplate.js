module.exports = "<html>" +
		"<head>" +
			"<script>" +
				"var head = document.getElementsByTagName('head')[0];" +

				"var pbjs = pbjs || {};" +
				"pbjs.que = pbjs.que || [];" +

				"var PREBID_TIMEOUT = __PB_TIMEOUT__;" +

				"var prebidScript = document.createElement('script');" +
				"prebidScript.async = true;" +
				"prebidScript.text = parent.adpPrebid.toString();" +
				"head.appendChild(prebidScript);" +

				"adpPrebid();" +

				"function serverRenderCode( timeout ){" +
					"if( serverRenderCode.isExecuted === undefined ) {" +
						"var pbjsParams = {" +
							"'_bidsReceived'  : pbjs._bidsReceived," +
							"'_bidsRequested' : pbjs._bidsRequested," +
							"'_adUnitCodes'   : pbjs._adUnitCodes," +
							"'_winningBids'   : pbjs._winningBids," +
							"'_adsReceived'   : pbjs._adsReceived" +
						"};" +
						"if( Number.isInteger(timeout) ) {" +
							"parent.__renderPrebidAd(pbjsParams, timeout);" +
						"} else {" +
							"parent.__renderPrebidAd(pbjsParams);" +
						"}" +

						"serverRenderCode.isExecuted = true;" +
					"}" +
				"}" +

				"setTimeout(function(){" +
					"serverRenderCode(PREBID_TIMEOUT);" +
				"}, PREBID_TIMEOUT);" +

				"pbjs.que.push(function(){" +
					"pbjs.setPriceGranularity('dense');" +
					"pbjs.addAdUnits(__AD_UNIT_CODE__);" +

					"pbjs.requestBids({" +
						"bidsBackHandler: serverRenderCode" +
					"});" +
				"})" +

			"</script>" +
		"</head>" +
		"<body></body>" +
	"</html>";