const BACKEND_API_URL = `http://staging.adpushup.com/OpsWebService/anomaly/save`

module.exports = {
    BACKEND_API_URL,
    consumer_key: '3886c1427947cac75c7034db82f590d01bc826d6',
    secret_key: 'd457b1ff100015ca3a7dd1d1ed7972aa455231a9',
    base_url: 'https://sso.openx.com/api/index/initiate',
    method: 'POST',
    queryParameters: {
        offset:0,
        limit:100,
        filter:"status='active'"
    }
}