module.exports = {
  environment: {
    // change to environment
    HOST_PORT: 8080,
    HOST_ENV: 'development',
    LOGS_DIR: 'logs',
    OPS_HOST_PORT: 8443
  },
  dfpNetworkCodes: {
    GENIEE: '11586562'
  },
  analytics: {
    pipedriveActivated: false,
    manualTagsActivated: false
  },
  reporting: {
    activated: true
  },
  services: {
    adStatsSyncService: {
      daysForUpdate: 365
    }
  },
  cacheFlyFtp: {
    HOST: '127.0.0.1',
  //   // app
  //   // USERNAME: 'apexAdpushup',
  //   // PASSWORD: 'sdfkh@804'

  //   // console
    USERNAME: 'anonymous',
  //   PASSWORD: '5e9e538f'
  },
  elasticServer: {
    host: 'localhost:9200',
    log: 'trace',
    requestTimeout: 3500 // in ms
  },
  googleOauth: {
    OAUTH_CLIENT_ID:
      '1058013895547-dagamjh7hg4rfv9r6qgsrkh4pajgqe73.apps.googleusercontent.com',
    OAUTH_CLIENT_SECRET: '3KXmKs9jnW92GUyB9d-I9Q5o',
    OAUTH_CALLBACK: 'http://localhost:8080/api/user/oauth2callback',
    OAUTH_SCOPE: [
      'https://www.googleapis.com/auth/adsense.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/adsensehost',
      'https://www.googleapis.com/auth/dfp'
    ].join(' ')
  },
  ADPUSHUP_GAM: {
    REFRESH_TOKEN: '1/Q136DItX0u5n28d3vi99M1xNi-qJsNTm3qcUxRtZjCk7Npig-UrT-i3Fv6K8Yqmw',
    ACTIVE_DFP_NETWORK: '103512698',
    ACTIVE_DFP_PARENTID: '102512818'
  },
  // Production
  // couchBase: {
  // 	HOST: '10.1.1.9',
  // 	USERNAME: 'administrator',
  // 	PASSWORD: 'gknVsthji5f3yQR$%@AYV',
  // 	DEFAULT_BUCKET: 'apAppBucket',
  // 	DEFAULT_BUCKET_PASSWORD: 'zgvzr26xwtAidA9EUa9IU',
  // 	SESSION_SECRET: 'ADPUSHUP_SESSION_KEY'
  // },
  // stagin
  // couchBase: {
  //   HOST: 'staging.adpushup.com',
  //   USERNAME: 'administrator',
  //   PASSWORD: 'ndiwncx9KdnbdR9#dL',
  //   DEFAULT_BUCKET: 'AppBucket',
  //   DEFAULT_BUCKET_PASSWORD: 'asd12345',
  //   DEFAULT_USER_NAME: 'appuser',
  //   DEFAULT_USER_PASSWORD: 'sttR45Ea6voy$$43',
  //   SESSION_SECRET: 'ADPUSHUP_SESSION_KEY'
  // },
  // local
  redisEnvironment: {
    REDIS_PORT: 6379,
    REDIS_HOST: '127.0.0.1',
  },
  couchBase: {
    HOST: '127.0.0.1',
    USERNAME: 'Admin',
    PASSWORD: 'asd12345',
    DEFAULT_BUCKET: 'AppBucket',
    DEFAULT_BUCKET_PASSWORD: 'asd12345',
    DEFAULT_USER_NAME: 'Admin',
    DEFAULT_USER_PASSWORD: 'asd12345',
    SESSION_SECRET: 'ADPUSHUP_SESSION_KEY'
  },
  globalBucket: {
    HOST: '127.0.0.1',
    USERNAME: 'admin',
    PASSWORD: 'asd12345',
    DEFAULT_BUCKET: 'apGlobalBucket',
    DEFAULT_BUCKET_PASSWORD: 'asd12345'
  },
  email: {
    MAIL_FROM: 'support@adpushup.com',
    MAIL_FROM_NAME: 'AdPushup Mailer',
    SMTP_SERVER: 'email-smtp.us-west-2.amazonaws.com',
    SMTP_USERNAME: 'wrong',
    SMTP_PASSWORD: 'wrong'
  },
  ops: {
    couchBaseBuckets: {
      apStatsBucket: {
        HOST: '127.0.0.1',
        USERNAME: 'administrator',
        PASSWORD: 'dSTt4%fnd7zxgfkfGg',
        BUCKET_PASSWORD: 'sttR45Ea6voy$$43'
      },
      apGlobalBucket: {
        HOST: '10.1.1.7',
        USERNAME: 'administrator',
        PASSWORD: 'gknVsthji5f3yQR$%@AYV',
        BUCKET_NAME: 'apGlobalBucket',
        BUCKET_PASSWORD: 'zgvzr26xwtAidA9EUa9IU'
      }
    },
    auth: {
      username: 'cbadmin',
      pass: 'hyperloop'
    },
    salt: 'adstxtsalt123',
    masterPswMd5: 'a8dd36503a629d4181cb545e3a53a03a'
  },
  jwt: {
    salt: '6981EDF13FB48'
  },
  RABBITMQ: {
    // localhost
    URL: 'amqp://guest:guest@localhost:5672',

    // new production
    // URL: 'amqp://rabbitAdmin:WY67rtuwi9aee@apdc1-central-daemon-1.eastus2.cloudapp.azure.com:5672',

    // old
    // URL: 'amqp://rabbitAdmin:WY67rtuwi9aee@apdc1-central-daemon-3.eastus2.cloudapp.azure.com:5672',
    GENIEE_AD_SYNC: {
      EXCHANGE: {
        name: 'genieeZoneSync',
        type: 'direct',
        options: { durable: true }
      },
      QUEUES: {
        GENIEE_AD_SYNC: {
          name: 'genieeZoneSync',
          options: { durable: true }
        }
      }
    },
    CDN_SYNC: {
      EXCHANGE: {
        name: 'consoleCdnSync',
        type: 'direct',
        options: { durable: true }
      },
      QUEUE: {
        name: 'consoleCdnSync',
        options: { durable: true }
      }
    },
    ADP_TAG_SYNC: {
      EXCHANGE: {
        name: 'adpTagSync',
        type: 'direct',
        options: { durable: true }
      },
      QUEUE: {
        name: 'adpTagSync',
        options: { durable: true }
      }
    },
    TRANSACTION_LOG_SYNC: {
      EXCHANGE: {
        name: 'transactionLogSync',
        type: 'direct',
        options: { durable: true }
      },
      QUEUE: {
        name: 'transactionLogSync',
        options: { durable: true }
      }
    },
    ADSENSE_AD_SYNC: {
            EXCHANGE: {
                name: 'adsenseAdSync',
                type: 'direct',
                options: { durable: true }
            },
            QUEUE: {
                name: 'adsenseAdSync',
                options: { durable: true }
            }
        }
  },
  sqlDatabases: {
    test: 'test',
    sql: 'central-sql',
    warehouse: 'central-warehouse'
  },
  sql: {
  //   user: 'apadmin',
  //   password: 'UYjhiJhvMHDHsYRsY2!',
  //   server: 'apdc1-central-sql.database.windows.net',
  //   database: 'central-sql',
  //   options: {
  //     encrypt: true
  //   },
  //   pool: {
  //     max: 10,
  //     min: 1,
  //     idleTimeoutMillis: 50000
  //   },
  //   connectionTimeout: 300000,
  //   requestTimeout: 300000
  },
  ampSettings: {
    selectors: {
      breadcrumb: { alias: 'Breadcrumb', value: 'breadcrumb' },
      headlineTitle: { alias: 'Headline Title', value: 'headlineTitle' },
      headlineSubtitle: {
        alias: 'Headline Subtitle',
        value: 'headlineSubtitle'
      },
      timeStampPublished: {
        alias: 'TimeStamp Published',
        value: 'timeStampPublished'
      },
      timeStampModified: {
        alias: 'TimeStamp Modified',
        value: 'timeStampModified'
      },
      authorInfo: { alias: 'Author Info', value: 'authorInfo' },
      articleContent: { alias: 'Article Content', value: 'articleContent' },
      logo: { alias: 'Logo', value: 'logo' }
    },
    socialApps: {
      facebook: { alias: 'Facebook', value: 'facebook' },
      twitter: { alias: 'Twitter', value: 'twitter' },
      linkedin: { alias: 'Linkedin', value: 'linkedin' },
      gmail: { alias: 'Gmail', value: 'gmail' },
      whatsapp: { alias: 'Whatsapp', value: 'whatsapp' },
      gplus: { alias: 'GPlus', value: 'gplus' }
    }
  },
  prebidServer: {
    host: 'https://amp.adpushup.com/'
  },
  // queuePublishingURL: 'http://queuePublisher.adpushup.com', // production URL
  queuePublishingURL: 'http://localhost:9009',
  urlReportingEnabledSites: []
};

/*
    Production
    consoleCdnSync - for cdn syncing and uploading adpushup.js
    genieeMCMZoneSync - for updating Geniee with adsense unit id and storing that id in our db
    genieeZoneSync - to sync unsynced zones with geniee and update channel doc and pulbish job to consoleCdnSync and MCM Automation
    

    adpDfpZoneSyncConsumer - /adpushup/QueueWorkers/adpDfpZoneSyncConsumer.js
    adsenseStatSyncService - /adpushup/App/app.js
    appCdnUpload - /adpushup/QueueWorkers/app.js
    consoleAdSyncConsumer - /adpushup/QueueWorkers/consoleAdSyncConsumer.js 
    genieeZoneSyncConsumer - /adpushup/QueueWorkers/genieeZoneSyncConsumer.js
*/

