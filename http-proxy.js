/* eslint-disable no-console */
var https = require('https'),
	http = require('http'),
	httpProxy = require('http-proxy'),
	url = require('url'),
	express = require('express'),
	zlib = require('zlib'),
	CC = require('./configs/commonConsts'),
	Config = require('./configs/config'),

	httpKeepAliveAgent = new http.Agent({ keepAlive: true }),
	httpsKeepAliveAgent = new https.Agent({ keepAlive: true }),

	app = express(),
	proxy = httpProxy.createProxyServer({
		changeOrigin: true
	}),

	BASE_URL = CC.BASE_URL,
	PROXY_URL = CC.PROXY_ORIGIN,

	redirectRegex = /^30(1|2|7|8)$/;

function parseCookies(request) {
	var list = {},
		rc = request.headers.cookie;

	rc && rc.split(';').forEach(function(cookie) {
		var parts = cookie.split('=');
		list[parts.shift().trim()] = decodeURI(parts.join('='));
	});

	return list;
}

app.use(function(req, res, next) {
	if (req.url.indexOf('/loadFromApProxy/?') === -1) {
		next();
		return;
	}
	var _writeHead = res.writeHead,
		_end = res.end,
		_write = res.write,
		chunks = [],
		encoding = '';

	res.writeHead = function() {
		res.removeHeader('Content-Length');
		//res.removeHeader('x-frame-options');
		encoding = res.getHeader('content-encoding');
		res.removeHeader('content-encoding');
		_writeHead.apply(res, arguments);
	};

	res.write = function(chunk) {
		chunks.push(chunk);
	};

	res.end = function() {
		var args = arguments,
			buffer = Buffer.concat(chunks);
		if (encoding === 'gzip') {
			zlib.gunzip(buffer, function(err, decoded) {
				if (!err) {
					_write.call(res, modifyHtml(req, decoded && decoded.toString()));
				} else {
					_write.call(res, 'something went wrong' + err.stack);
				}
				_end.apply(res, args);
			});
		} else if (encoding === 'deflate') {
			zlib.inflate(buffer, function(err, decoded) {
				if (!err) {
					_write.call(res, modifyHtml(req, decoded && decoded.toString()));
				} else {
					_write.call(res, 'something went wrong' + err.stack);
				}
				_end.apply(res, args);
			});
		} else {
			_write.call(res, modifyHtml(req, buffer.toString()));
			_end.apply(res, args);
		}
	};
	next();
});

app.get('/loadFromApProxy', function(req, res) {
	var rawUrl = new Buffer(req.query.url, 'base64').toString(),
		urlObj = url.parse(rawUrl, true),
		userAgent, target, baseUrl;
	switch (req.query.platform.toLowerCase()) {
		case 'mobile':
			userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53';
			break;
		case 'tablet':
			userAgent = 'Mozilla/5.0 (iPad; CPU OS 4_3_5 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8L1 Safari/6533.18.5';
			break;
		default:
			userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
	}

	if (urlObj.hostname && urlObj.protocol) {
		target = urlObj.protocol + '//' + urlObj.hostname;
		baseUrl = urlObj.path.substring(0, urlObj.path.lastIndexOf('/'));

		req.headers['user-agent'] = userAgent;
		req.url = urlObj.path || '/';
		req.editResponse = true;

		runProxy(req, res, target, baseUrl);
	} else {
		res.status(500).send('Malformed Url, PLease Check.');
	}
});

app.get('*', function(req, res) {
	var target = parseCookies(req)['ap-proxy-target-domain-cookie'],
		baseUrl = parseCookies(req)['ap-proxy-target-baseurl-cookie'],
		userAgent = decodeURI(parseCookies(req)['ap-proxy-target-ua-cookie']),
		encodedUrl = encodeURIComponent(PROXY_URL);
	req.headers['user-agent'] = userAgent;
	baseUrl = baseUrl || '';
	if (req.url.indexOf('/loadFromApProxy') === 0) {
		req.url = req.url.replace('/loadFromApProxy', baseUrl);
	}

	if (req.url.indexOf(encodedUrl) > -1) {
		req.url = req.url.replace(encodedUrl, encodeURIComponent(target));
	}

	if (target) {
		runProxy(req, res, target);
	}
});

function runProxy(req, res, target, baseUrl) {
	var protocol = target.split('://')[0],
		hostname = target.split('://')[1],
		headers = { 'user-agent': req.headers['user-agent'] },
		proxyOptions = { target: target, headers: headers },
		proxyResListener, id = Math.random();

	headers.hostname = hostname;
	headers['Access-Control-Allow-Origin'] = '*';
	if (protocol === 'https') {
		proxyOptions.agent = httpsKeepAliveAgent;
	} else {
		proxyOptions.agent = httpKeepAliveAgent;
	}

	proxy.web(req, res, proxyOptions);

	req.randomId = id;

	// eslint-disable-next-line no-shadow
	proxyResListener = function proxyResListenerfn(proxyRes, req) {
		if (id === req.randomId && req.editResponse) {
			if (redirectRegex.test(proxyRes.statusCode) && target !== proxyRes.headers['location']) {
				var newUrl = proxyRes.headers.location,
					newOriginalUrl,
					targetCookie,
					userAgentCookie,
					baseUrlCookie;
				if (newUrl.indexOf(req.url) === -1){
					newUrl = newUrl + req.url;
				}
				newUrl = new Buffer(newUrl).toString('base64');
				newOriginalUrl = req.originalUrl.replace(/url=.*?&./, 'url=' + newUrl + '&');
				proxyRes.headers.location = PROXY_URL + newOriginalUrl;
			} else {
				targetCookie = 'ap-proxy-target-domain-cookie=' + target + '; path=/';
				userAgentCookie = 'ap-proxy-target-ua-cookie=' + encodeURI(req.headers['user-agent']) + '; path=/';
				if (!proxyRes.headers['set-cookie']) {
					proxyRes.headers['set-cookie'] = [];
				}
				if (baseUrl) {
					baseUrlCookie = 'ap-proxy-target-baseurl-cookie=' + baseUrl + '; path=/';
				}

				for (var key in proxyRes.headers) {
					console.log(key.toLowerCase());
					if (key.toLowerCase() === 'x-frame-options'){
						delete proxyRes.headers[key];
					}
				}

				proxyRes.headers['set-cookie'].push(targetCookie);
				proxyRes.headers['set-cookie'].push(userAgentCookie);
				if (baseUrlCookie) {
					proxyRes.headers['set-cookie'].push(baseUrlCookie);
				}
			}
			// eslint-disable-next-line no-caller
			proxy.off('proxyRes', arguments.callee);
		}
	};

	if (req.editResponse) {
		proxy.on('proxyRes', proxyResListener);
	}
}

proxy.on('error', function(err, req, res) {
	res.writeHead(500);
	res.end();
});

app.use(function(err, req, res, next) {
	console.error('error in app', err.stack);
	res.status(500).send('Something broke! Please contact support');
	res.end();
});

app.listen(5050, function() {
	console.log('listening on port 5050');
});

function modifyHtml(req, str) {
	var isEnvironmentProduction = (Config.development.HOST_ENV === 'production'),
		reactJsStr = isEnvironmentProduction ? 'react-0-13-1.min.js' : 'react.js',
		innerBuildStr = isEnvironmentProduction ? 'inner-build.min.js' : 'inner-build.js',
		// head code to be injected at the start of the head
		headCode = [
			'<!-- AdPushup Starts -->',
			'<script async="false" src="' + BASE_URL + '/assets/js/libs/third-party/' + reactJsStr + '"></script>',
			'<script type="text/javascript">',
			'var adpushup = adpushup || {};',
			'adpushup.disable = true;',
			'window.ADP_BASEURL = "' + BASE_URL + '";',
			'window.ADP_ORIGIN = "' + BASE_URL + '";',
			'window.ADP_ENVIRONMENT = "' + Config.development.HOST_ENV + '";',
			'ADP_CHANNEL_ID = "' + req.query.channelId + '";',
			'document.domain = "' + CC.PROXY_DOCUMENT_DOMAIN + '";',
			'</script>',
			'<!-- AdPushup Ends -->'
		],
		// body code to be insrted before end of the body
		bodyCode = [
			'<!-- AdPushup Starts -->',
			'<script src="' + BASE_URL + '/assets/js/editor/build/' + innerBuildStr + '"></script>',
			'<!-- AdPushup Ends -->'
		],
		headTagRegex = /<head.*?>/i;

	headCode = headCode.join('');
	bodyCode = bodyCode.join('');

	if (str.match(headTagRegex)) {
		str = str.replace(headTagRegex, '<head>' + headCode);
	} else {
		str = headCode + str;
	}
	str = str + bodyCode;

	return str;
}
