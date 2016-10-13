var cheerio = require('cheerio'),
	express = require('express'),
	consts = require('../configs/commonConsts'),
	utils = require('../helpers/utils'),
	proxy = require('../helpers/proxy'),
	// eslint-disable-next-line new-cap
	router = express.Router();

router
	.get('/loadPage', function(req, res) {
		var userAgent = '',
			url = new Buffer(req.query.url, 'base64').toString(),
			headCode = [
				'<head><!-- AdPushup Starts -->',
				'<base href="' + utils.getDomain(url) + '">',
				'<script async="false" src="' + consts.BASE_URL + '/assets/js/libs/third-party/react.js"></script>',
				'<script type="text/javascript" src="//code.jquery.com/jquery-1.11.3.min.js"></script>',
				'<script type="text/javascript">',
				'var adpushup = adpushup || {};',
				'adpushup.disable = true',
				'window.ADP_BASEURL = "' + consts.BASE_URL + '";',
				'window.ADP_ORIGIN = "' + consts.BASE_URL + '";',
				'ADP_CHANNEL_ID = "' + req.query.channelId + '";',
				'</script>',
				'<!-- AdPushup Ends -->'
			],
			bodyCode = [
				'<!-- AdPushup Starts -->',
				'<script src="' + consts.BASE_URL + '/assets/js/editor/build/inner-build.js"></script>',
				'<!-- AdPushup Ends --></body>'
			];

		switch (req.query.platform) {
			case 'mobile':
				userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53';
				break;
			case 'tablet':
				// Apple iPad 1/2/Mini
				userAgent = 'Mozilla/5.0 (iPad; CPU OS 4_3_5 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8L1 Safari/6533.18.5';
				break;
			default:
				userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
		}

		function injectInit($) {
			//  If base tag already in site then don't add our base tag
			if ($('base').length) {
				headCode.splice(1, 1);
			}
			$('head').prepend(headCode.join('\n'));
			$('body').append(bodyCode.join('\n'));
		}

		if (req.query.useAlternateProxy === 'true') {
			try {
				// Cheerio will be used if alternate proxy is used
				proxy.load(url, userAgent, true).then(function(response) {
					var body = response.body,
						$ = cheerio.load(body, {
							decodeEntities: false,
							recognizeSelfClosing: true
						});
					injectInit($);
					res.set('Content-Type', response.headers['content-type']);
					res.send($.html());
					res.end();
				}).catch(function(err) {
					res.status(500);
					res.send('err:' + err.toString());
				});
			} catch (err) {
				res.status(500);
				res.send('err:' + err.toString());
			}
		}
	})
	.get('/detectCms', function(req, res) {
		var json = {};
		proxy.detectWp(req.query.site)
			.then(function(result) {
				json.wordpress = result;
				return json;
			})
			.then(proxy.detectAdPushup.bind(null, req.query.site))
			.then(function(apInfo) {
				json.ap = apInfo;
				return res.json(json);
			})
			.catch(function(err) {
				res.send('err: ' + err);
			});
	})
	.get('/detectAp', function(req, res) {
		proxy.detectCustomAp(req.query.url)
			.then(function(result) {
				res.json({ ap: result });
			})
			.catch(function() {
				res.json({ ap: false });
			});
	});

module.exports = router;
