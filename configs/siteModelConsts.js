module.exports = {
    apConfigs: {
        engineRequestTimeout: 4000,
        xpathWaitTimeout: 5000,
        mode: 2,
        adpushupPercentage: 90,
        displayMethod: 2,
        explicitPlatform: true,
        blocklist: [],
        adRecover: {
            mode: 2,
            pageGroupPattern: []
        }
    },
    adNetworks: [{
        name: 'ADSENSE',
        displayType: 'BANNER',
        revenueType: 'CPC',
        maxAdsToDisplay: 3,
        supportedSizes: [{
            layoutType: 'CUSTOM',
            sizes: []
        }]
    }],
    audiences: {
        rootCondition: {
            condition: [{
                condition: [{
                    type: 'operand',
                    value: '*'
                }, {
                    type: 'operation',
                    value: '='
                }, {
                    type: 'operand',
                    value: '*'
                }]
            }]
        },
        defination: '( * = * )'
    },
    actions: {
    	key: 'ADSENSE',
    	dataType: 'ADNETWORK',
    	owner: 'SITE',
    	ownerId: null
    }
};