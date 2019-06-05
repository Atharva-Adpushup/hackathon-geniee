// Global constants 

var constants = {
    EVENTS: {
        GPT: {
            SLOT_RENDER_ENDED: 'slotRenderEnded'
        },
        PREBID: {
            BID_WON: 'bidWon'
        }
    },
    ERROR_CODES: {
        NO_ERROR: 1
    },
    NETWORK_ID: 103512698,
    DEFAULT_WINNER: 'adx',
    FEEDBACK_URL: '//e3.adpushup.com/AdPushupFeedbackWebService/feedback/aphb?data=',
    PREBID_TIMEOUT: 3000,
    SLOT_INTERVAL: 50
};

module.exports = constants;