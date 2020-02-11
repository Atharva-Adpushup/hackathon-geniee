module.exports = {
    db: {
        host: 'localhost',
        port: 8091,
        username: 'admin',
        password: 'asd12345',
        bucketName: 'AppBucket',
    },
    dfp: {
        adpushup_network_code: '103512698',
        auth: {
            client_id : '1058013895547-dagamjh7hg4rfv9r6qgsrkh4pajgqe73.apps.googleusercontent.com',
            client_secret : '3KXmKs9jnW92GUyB9d-I9Q5o',
            refresh_token : '1/Q136DItX0u5n28d3vi99M1xNi-qJsNTm3qcUxRtZjCk7Npig-UrT-i3Fv6K8Yqmw',
            redirect_url : "http://dfptest.local/user/oauth2callback"
        },
        user: {
            network_code: '', 
            app_name: 'adManagerSyncService', 
            version: 'v201902'
        }
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