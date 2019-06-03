// Common utility functions

var adp = require('./adp');
var utils = {
    ajax: function (type, url, data) {
        switch (type.toLowerCase()) {
            case 'get':
                return adp.$.get(url + adp.utils.base64Encode(JSON.stringify(data)));
        }
    }
}

module.exports = utils;