const config = require('./config');
const utils = require('../../libs/utils');

var pnpRefresh = {
    init: function() {
        window.pnpRefresh = window.pnpRefresh || config;
        utils.log('Initialising PnP refresh');
    }
}

module.exports = pnpRefresh; 