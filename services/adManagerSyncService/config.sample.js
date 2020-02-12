module.exports = {
    appName: 'adManagerSyncService',
    dfpApiVersion: 'v201902',
    serviceStatusPingDelayMs: 1000,
    serviceStatusDb: {
        host: 'localhost',
        port: 8091,
        username: 'admin',
        password: 'asd12345',
        bucketName: 'AppBucket'
    },
    db: {
        host: 'localhost',
        port: 8091,
        username: 'admin',
        password: 'asd12345',
        bucketName: 'AppBucket',
    },
    logger: {
        db: {
            host: 'localhost',
            port: 8091,
            username: 'admin',
            password: 'asd12345',
            bucketName: 'AppBucket'
        },
        logExpiryDays: 30,
        serviceName: 'AdManagerSyncService'
    }
};