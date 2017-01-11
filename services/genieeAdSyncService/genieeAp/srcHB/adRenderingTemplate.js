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
						"if( Number.isInteger(timeout) ) {" +
							"parent.__renderPrebidAd(pbjs._bidsReceived, pbjs._adUnitCodes, timeout);" +
						"} else {" +
							"parent.__renderPrebidAd(pbjs._bidsReceived, pbjs._adUnitCodes);" +
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