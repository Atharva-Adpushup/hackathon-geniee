var https = require('https'),
    CC = require('../../configs/commonConsts'),
    pipeDriveObject = function() {

        var path = null,
            searchPhrase = null,
            method = null;

        var setAction = function(action) {
            switch(action) {
                case 'isUserPresent':
                    path  = '/v1/searchResults?term=' + searchPhrase;
                    path += '&item_type=person&start=0&api_token=' + CC.analytics.PIPEDRIVE_SYNC_TOKEN;
                    method = 'GET';
                    break;
                case 'fetchUserDetails':
                    path  = '/v1/persons/' + searchPhrase;
                    path += '?api_token=' + CC.analytics.PIPEDRIVE_SYNC_TOKEN;
                    method = 'GET';
                    break;
                case 'updateDealStatus':
                    path  = '/v1/deals/' + searchPhrase;
                    path += '?api_token=' + CC.analytics.PIPEDRIVE_SYNC_TOKEN;
                    method = 'PUT';
                    break;
                default:
                    break;
            }        
        };

        var apiCall = function(action, params) {
            var str = '',
                dataToSend = params.dataToSend || null,
                stringBodyContent = '';
            searchPhrase = params.searchText;
            setAction(action);
            return new Promise(function(resolve, reject) {
                if(dataToSend && dataToSend != null) {
                    stringBodyContent = JSON.stringify(dataToSend);
                }            
                var options = {
                    hostname: 'api.pipedrive.com',
                    path: path,
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                };
                var req = https.request(options, (res) => {
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => {
                        str += chunk;
                    });
                    res.on('end', () => {
                        resolve(str);
                    });
                });
                req.on('error', (e) => {
                    reject(e.message);
                });
                if(dataToSend && dataToSend != null) {
                    req.write(stringBodyContent);
                }
                req.end();
            });
        };

        return {
            apiCall: apiCall
        };
    };

module.exports = pipeDriveObject;