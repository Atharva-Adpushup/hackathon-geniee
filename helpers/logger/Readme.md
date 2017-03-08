# JSON logger middleware

An Express JS HTTP logging middleware that supports JSON and Apache-style logging.
> Generates JSON logs for the specified file stream, makes logs easy to parse and process. 

> Logs standard Apache ``combined`` log style output for the standatd output stream. 

> Supports logging of request ``body`` and ``params``. Easy to use ``events``.

## Usage

Require the logger module in your Express app.

```javascript
const { logger } = require('./logger/index');
```

Include the middleware in your app's middleware chain.

```javascript
app.use(logger({
	stream: ['./logs/http-logs.log'],
	logHeaders: false,
	logFor: ['/api'],
	logToStdOut: false
}));
```

> Note: Make sure to include this middleware after the ``body-parser`` middleware if you want to log the request ``body`` as well.

## Options

### ``stream {array} | required``
This is a required option. It specifies the file stream to which you want to save all the logs to.

```javascript
app.use(logger({
	stream: ['./logs/http-logs.log']
}));
```

All log entries saved to the file stream are stored in ``JSON`` format. 

Example - 

```json
{
    "responseTime": "2450ms",
    "method": "GET",
    "url": "/user/site/9/dashboard",
    "ip": "127.0.01",
    "body": {},
    "params": {
        "siteId": "9"
    },
    "query": {},
    "httpVersion": "1.1",
    "statusCode": 200,
    "timeStamp": "2017-03-07T22:09:11.111Z",
    "contentType": "text/html; charset=utf-8",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
    "referrer": null
}
```

### ``logHeaders {boolean} | optional | Default: false``
It specifies whether the request headers should be saved for all logs being generated and added to the file ``stream`` or not.

```javascript
app.use(logger({
	stream: ['./logs/http-logs.log'],
	logHeaders: true
}));
```

### ``logFor {array} | optional``
It specifies all the URLs for which you would like to enable logging for. By default, log entry is generated for all the URLs.

```javascript
app.use(logger({
	stream: ['./logs/http-logs.log'],
	logFor: ['/user-api', '/dashboard', '/status-api']
}));
```

### ``logToStdOut {boolean} | optional | Default: true``
It specifies whether the generated log entry should be logged to the standard writable output stream i.e. ``process.stdout`` or not.

```javascript
app.use(logger({
	stream: ['./logs/http-logs.log'],
	logToStdOut: false
}));
```

The entry is logged in standard Apache ``combined`` log style i.e. - 

```javascript
:remote-ip [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
```

Example - 

```javascript
127.0.01 [Wed Mar 08 2017 03:39:11 GMT+0530 (IST)] "GET /user/site/9/dashboard HTTP1.1" 200 - - "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"
```

## Events

Require ``loggerEvents`` from the module in order to use the events associated with the logger.

```javscript
const { logger, loggerEvents } = require('./helpers/logger/index');
```

### ``log``

This event is fired whenever a log entry is generated.

```javascript
loggerEvents.on('log', function(log) {
	console.log(`The following log entry was added - \n ${log}`)
});
```

### ``:statusCode``

This event is fired whenever a specific status code is returned from the request.

```javascript
loggerEvents.on('200', function(log) {
	console.log('Success!')
});
```

```javascript
loggerEvents.on('403', function(log) {
	console.log('Request forbidden!')
});
```

### ``error``

This event is fired whenever an error is returned from the request. 

All requests returning a status code of ``>=400`` are considered to be errored. Please refer to the HTTP status codes [guide](http://www.restapitutorial.com/httpstatuscodes.html) for more info.

```javascript
loggerEvents.on('error', function(log) {
	console.log('Errored!')
});
```


















