module.exports = {
    appName: 'adManagerSyncService',
    dfpApiVersion: 'v201902',
    serviceStatusPingDelayMs: 1000, // this should not be changed
    // database where service will store its status doc
    serviceStatusDb: {
        host: 'localhost',
        port: 8091,
        username: 'admin',
        password: 'asd12345',
        bucketName: 'AppBucket' // on staging and production this should be apLocalBucket, needs to be indexed
    },
    // database where user docs are queried for active dfp network and ntwk docs will be stored
    db: {
        host: 'localhost',
        port: 8091,
        username: 'admin',
        password: 'asd12345',
        bucketName: 'AppBucket',
    },
    // logging database
    logger: {
        db: {
            host: 'localhost',
            port: 8091,
            username: 'admin',
            password: 'asd12345',
            bucketName: 'AppBucket' // this should be apGlobalBucket on staging and production
        },
        logExpiryDays: 30,
        serviceName: 'AdManagerSyncService'
    }
};