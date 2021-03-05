// const crypto = require('crypto');
// const uuid = require('uuid');
// const Config = require('./config');
// const axios = require('axios');

// const method = Config.method;
// const base_url = Config.base_url;
// const secret_key = Config.secret_key;

// /**
//  * Get Current Unix TimeStamp
//  * @return {Int} current unix timestamp
//  */
// const getTimeStamp = function() {
//     //return parseInt(new Date().getTime()/1000, 10);
//     // changed by sourabh
//     var now = new Date;
// return  utc_timestamp = Date.UTC(now.getUTCFullYear(),now.getUTCMonth(), now.getUTCDate() ,
//       now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
// };
// // const oauth_timestamp = Math.floor(Date.now() / 1000);
// const oauth_timestamp = getTimeStamp();
// console.log(oauth_timestamp, 'oauth_timestamp')
// const oauth_nonce = +Date.now();

// const parameters = {
//     // ...Config.queryParameters,
//     oauth_consumer_key: Config.consumer_key,
//     oauth_signature_method: 'HMAC-SHA1',
//     oauth_timestamp: oauth_timestamp,
//     oauth_nonce: oauth_nonce,
//     oauth_version: '1.0'
// }
// let ordered = {};
// Object.keys(parameters).sort().forEach(function(key) {
//   ordered[key] = parameters[key];
// });
// let encodedParameters = '';
// for (k in ordered) {
//     let encodedValue = escape(ordered[k]);
//     let encodedKey = encodeURIComponent(k);
//     if(encodedParameters === ''){
//         encodedParameters += `${encodedKey}=${encodedValue}`;
//     }
//     else{
//         encodedParameters += `&${encodedKey}=${encodedValue}`;
//     } 
// }
// console.log(encodedParameters, 'encodedParameters\n\n');

// const encodedUrl = encodeURIComponent(base_url);
// encodedParameters = encodeURIComponent(encodedParameters);

// const signature_base_string = `${method}&${encodedUrl}&${encodedParameters}`

// console.log(signature_base_string, 'signature_base_string\n\n');

// const signing_key = `${secret_key}&`; //as token is missing in our case.

// const oauth_signature = crypto.createHmac('sha1', signing_key).update(signature_base_string).digest().toString('base64');

// console.log(oauth_signature, 'oauth_signature\n\n');

// const encoded_oauth_signature = encodeURIComponent(oauth_signature);

// console.log(encoded_oauth_signature, 'encoded_oauth_signature\n\n');

// const authorization_header = `OAuth oauth_consumer_key="${Config.consumer_key}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${oauth_timestamp}",oauth_nonce="${oauth_nonce}",oauth_version="1.0",oauth_callback="oob",oauth_signature="${encoded_oauth_signature}"`

// console.log(authorization_header, 'authorization_header\n\n');

// // OAuth oauth_consumer_key="3886c1427947cac75c7034db82f590d01bc826d6",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1614339633",oauth_callback="oob",oauth_nonce="123",oauth_version="1.0",oauth_signature="eVZGyAWnuxJZzCgMBvBi0Yy%2Fdk0%3D"
// // var axios = require('axios');

// // var config = {
// //   method: 'post',
// //   url: `https://sso.openx.com/api/index/initiate?oauth_consumer_key="3886c1427947cac75c7034db82f590d01bc826d6",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${oauth_timestamp}",oauth_nonce="${oauth_nonce}",oauth_version="1.0",oauth_signature="${encoded_oauth_signature}&oauth_callback=oob&oauth_version=1.0`,
// //   headers: { 
// //     'Cookie': 'PHPSESSID=09sl7anshrv8k30mqr98q6aqs2'
// //   }
// // };

// // axios(config)
// // .then(function (response) {
// //   console.log(JSON.stringify(response.data));
// // })
// // .catch(function (error) {
// //   console.log(error);
// // });


// // curl -H 'Authorization: OAuth oauth_consumer_key="3886c1427947cac75c7034db82f590d01bc826d6",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1614340717",oauth_nonce="1614340717683",oauth_version="1.0",oauth_callback="oob",oauth_signature="shtCokCwmUsaUSMibT%2Fspx46V4w%3D" ' --request POST https://sso.openx.com/api/index/initiate

// // const request = {
// //     url: 'https://sso.openx.com/api/index/initiate',
// //     method: 'POST',
// //     body: {
// //         "uniqueId": 1234
// //     }
// // };
// // const run = async () => {
// // 	console.log(authorization_header, 'authorization_header')
// // 	const res = await axios.post(
// // 		request.url,
// // 		request.body,
// // 		{ headers: authorization_header });
// // 	console.log(res)
// // }

// // run();

// const apiUrl = 'https://sso.openx.com/api/index/initiate'
// let oauthData=`oauth_consumer_key=${"3886c1427947cac75c7034db82f590d01bc826d6"}&oauth_signature_method=HMAC-SHA1&oauth_timestamp=${oauth_timestamp}&oauth_nonce=${oauth_nonce}&oauth_callback="oob"&oauth_version=1.0&oauth_signature=${oauth_signature}= HTTP/1.1`;

// const request = require('request');
// request.post(`${apiUrl}?${oauthData}`, {
//     oauth: {
//         consumer_key: '3886c1427947cac75c7034db82f590d01bc826d6',
// 		consumer_secret: 'd457b1ff100015ca3a7dd1d1ed7972aa455231a9',
// 		callback: 'oob'
//     },
//     headers: {
//         Accept: 'application/json'
//     },
// }, function (err, res, body) {
//     console.log(body);
// })



if (typeof(module) !== 'undefined' && typeof(exports) !== 'undefined') {
    module.exports = OAuth;
    var CryptoJS = require("crypto-js");
}

/**
 * Constructor
 * @param {Object} opts consumer key and secret
 */
function OAuth(opts) {
    if(!(this instanceof OAuth)) {
        return new OAuth(opts);
    }

    if(!opts) {
        opts = {};
    }

    if(!opts.consumer) {
        throw new Error('consumer option is required');
    }

    this.consumer            = opts.consumer;
    this.signature_method    = opts.signature_method || 'HMAC-SHA1';
    this.nonce_length        = opts.nonce_length || 32;
    this.version             = opts.version || '1.0';
    this.parameter_seperator = opts.parameter_seperator || ', ';

    if(typeof opts.last_ampersand === 'undefined') {
        this.last_ampersand = true;
    } else {
        this.last_ampersand = opts.last_ampersand;
    }

    switch (this.signature_method) {
        case 'HMAC-SHA1':
            this.hash = function(base_string, key) {
                return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
            };
            break;

        case 'HMAC-SHA256':
            this.hash = function(base_string, key) {
                return CryptoJS.HmacSHA256(base_string, key).toString(CryptoJS.enc.Base64);
            };
            break;

        case 'PLAINTEXT':
            this.hash = function(base_string, key) {
                return key;
            };
            break;
           
        case 'RSA-SHA1':
            throw new Error('oauth-1.0a does not support this signature method right now. Coming Soon...');
        default:
            throw new Error('The OAuth 1.0a protocol defines three signature methods: HMAC-SHA1, RSA-SHA1, and PLAINTEXT only');
    }
}

/**
 * OAuth request authorize
 * @param  {Object} request data
 * {
 *     method,
 *     url,
 *     data
 * }
 * @param  {Object} public and secret token
 * @return {Object} OAuth Authorized data
 */
OAuth.prototype.authorize = function(request, token) {
    var oauth_data = {
        oauth_callback:    'oob',    //    added by sourabh
        oauth_consumer_key: this.consumer.public,
        oauth_nonce: this.getNonce(),
        oauth_signature_method: this.signature_method,
        oauth_timestamp: this.getTimeStamp(),
        oauth_version: this.version
    };

    if(!token) {
        token = {};
    }

    if(token.public) {
        //oauth_data.oauth_token = token.public;    //    commented by sourabh
    }

    if(!request.data) {
        request.data = {};
    }

    oauth_data.oauth_signature = this.getSignature(request, token.secret, oauth_data);

    return oauth_data;
};

/**
 * Create a OAuth Signature
 * @param  {Object} request data
 * @param  {Object} token_secret public and secret token
 * @param  {Object} oauth_data   OAuth data
 * @return {String} Signature
 */
OAuth.prototype.getSignature = function(request, token_secret, oauth_data) {
    return this.hash(this.getBaseString(request, oauth_data), this.getSigningKey(token_secret));
};

/**
 * Base String = Method + Base Url + ParameterString
 * @param  {Object} request data
 * @param  {Object} OAuth data
 * @return {String} Base String
 */
OAuth.prototype.getBaseString = function(request, oauth_data) {
    return request.method.toUpperCase() + '&' + this.percentEncode(this.getBaseUrl(request.url)) + '&' + this.percentEncode(this.getParameterString(request, oauth_data));
};

/**
 * Get data from url
 * -> merge with oauth data
 * -> percent encode key & value
 * -> sort
 *
 * @param  {Object} request data
 * @param  {Object} OAuth data
 * @return {Object} Parameter string data
 */
OAuth.prototype.getParameterString = function(request, oauth_data) {
    var base_string_data = this.sortObject(this.percentEncodeData(this.mergeObject(oauth_data, this.mergeObject(request.data, this.deParamUrl(request.url)))));

    var data_str = '';

    //base_string_data to string
    for(var key in base_string_data) {
        data_str += key + '=' + base_string_data[key] + '&';
    }

    //remove the last character
    data_str = data_str.substr(0, data_str.length - 1);
    return data_str;
};

/**
 * Create a Signing Key
 * @param  {String} token_secret Secret Token
 * @return {String} Signing Key
 */
OAuth.prototype.getSigningKey = function(token_secret) {
    token_secret = token_secret || '';

    if(!this.last_ampersand && !token_secret) {
        return this.percentEncode(this.consumer.secret);
    }
    // commented by Sourabh
    //return this.percentEncode(this.consumer.secret) + '&' + this.percentEncode(token_secret);
    return this.percentEncode(this.consumer.secret) + '&';
};

/**
 * Get base url
 * @param  {String} url
 * @return {String}
 */
OAuth.prototype.getBaseUrl = function(url) {
    return url.split('?')[0];
};

/**
 * Get data from String
 * @param  {String} string
 * @return {Object}
 */
OAuth.prototype.deParam = function(string) {
    var arr = decodeURIComponent(string).split('&');
    var data = {};

    for(var i = 0; i < arr.length; i++) {
        var item = arr[i].split('=');
        data[item[0]] = item[1];
    }
    return data;
};

/**
 * Get data from url
 * @param  {String} url
 * @return {Object}
 */
OAuth.prototype.deParamUrl = function(url) {
    var tmp = url.split('?');

    if (tmp.length === 1)
        return {};

    return this.deParam(tmp[1]);
};

/**
 * Percent Encode
 * @param  {String} str
 * @return {String} percent encoded string
 */
OAuth.prototype.percentEncode = function(str) {
    return encodeURIComponent(str)
        .replace(/\!/g, "%21")
        .replace(/\*/g, "%2A")
        .replace(/\'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29");
};

/**
 * Percent Encode Object
 * @param  {Object} data
 * @return {Object} percent encoded data
 */
OAuth.prototype.percentEncodeData = function(data) {
    var result = {};

    for(var key in data) {
        result[this.percentEncode(key)] = this.percentEncode(data[key]);
    }

    return result;
};

/**
 * Get OAuth data as Header
 * @param  {Object} oauth_data
 * @return {String} Header data key - value
 */
OAuth.prototype.toHeader = function(oauth_data) {
    oauth_data = this.sortObject(oauth_data);

    var header_value = 'OAuth ';

    for(var key in oauth_data) {
        if (key.indexOf('oauth_') === -1)
            continue;
        header_value += this.percentEncode(key) + '="' + this.percentEncode(oauth_data[key]) + '"' + this.parameter_seperator;
    }

    return {
        Authorization: header_value.substr(0, header_value.length - this.parameter_seperator.length) //cut the last chars
    };
};

/**
 * Create a random word characters string with input length
 * @return {String} a random word characters string
 */
OAuth.prototype.getNonce = function() {
    var word_characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = '';

    for(var i = 0; i < this.nonce_length; i++) {
        result += word_characters[parseInt(Math.random() * word_characters.length, 10)];
    }

    return result;
};

/**
 * Get Current Unix TimeStamp
 * @return {Int} current unix timestamp
 */
OAuth.prototype.getTimeStamp = function() {
    //return parseInt(new Date().getTime()/1000, 10);
    // changed by sourabh
    var now = new Date;
return  utc_timestamp = Date.UTC(now.getUTCFullYear(),now.getUTCMonth(), now.getUTCDate() ,
      now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
};

////////////////////// HELPER FUNCTIONS //////////////////////

/**
 * Merge object
 * @param  {Object} obj1
 * @param  {Object} obj2
 * @return {Object}
 */
OAuth.prototype.mergeObject = function(obj1, obj2) {
    var merged_obj = obj1;
    for(var key in obj2) {
        merged_obj[key] = obj2[key];
    }
    return merged_obj;
};

/**
 * Sort object by key
 * @param  {Object} data
 * @return {Object} sorted object
 */
OAuth.prototype.sortObject = function(data) {
    var keys = Object.keys(data);
    var result = {};

    keys.sort();

    for(var i = 0; i < keys.length; i++) {
        var key = keys[i];
        result[key] = data[key];
    }

    return result;
};


var auth = new OAuth({
    consumer: {
        public: '3886c1427947cac75c7034db82f590d01bc826d6',
        secret: 'd457b1ff100015ca3a7dd1d1ed7972aa455231a9'
    }
})
const reqObj = auth.authorize({
    method: 'post',
    url:'https://sso.openx.com/api/index/initiate'
});

// const params = {foo: "hi there", bar: "100%" };
const querystring = require('querystring')
const result = querystring.stringify(reqObj)
console.log(result);

// // OAuth oauth_consumer_key="3886c1427947cac75c7034db82f590d01bc826d6",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1614339633",oauth_callback="oob",oauth_nonce="123",oauth_version="1.0",oauth_signature="eVZGyAWnuxJZzCgMBvBi0Yy%2Fdk0%3D"
var axios = require('axios');

var config = {
  method: 'post',
  url: `https://sso.openx.com/api/index/initiate?${result}`,
  headers: { 
    'Content-Type': 'application/json',
    'Cookie': 'PHPSESSID=09sl7anshrv8k30mqr98q6aqs2'
  }
};

axios(config)
.then(response => response.data)
.then(function (response) {
    const resObj = {};
    response.split('&').map(item => {
        const [key, val] = item.split('=');
        resObj[key] = val
        return item;
    });
    console.log(resObj, 'resObj')
})
.catch(function (error) {
  console.log(error);
});