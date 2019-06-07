// Site config

var config = {
    SITE_ID: 1, //__SITE_ID__,
    INVENTORY: {
        dfpAdUnits: {
            "300x250": ["ADP_37780_300X250_e342d0a9-0089-42fe-8897-49342aa190e5"]
        },
        hbConfig: {
            "conversant": {
                "name": "Conversant",
                "isApRelation": true,
                "isPaused": false,
                "sizeLess": false,
                "reusable": true,
                "bids": "net",
                "config": {
                    "300x250": {
                        "secure": 1,
                        "site_id": "565"
                    },
                    "120x600": {
                        "secure": 1,
                        "site_id": "565464"
                    }
                }
            },
            "33across": {
                "name": "33 Across",
                "isApRelation": true,
                "isPaused": false,
                "sizeLess": true,
                "reusable": true,
                "bids": "gross",
                "revenueShare": "23",
                "config": {
                    "productId": "inview",
                    "siteId": "345345"
                }
            }
        }
    }, //__INVENTORY__
};

module.exports = config;