// Used in client as well

const LINE_ITEM_TYPES = [
    {
        name: 'Ad Exchange',
        value: 'AD_EXCHANGE',
        key: 'AD_EXCHANGE',
        isMandatory: true
    },
    {
        name: 'Price Priority',
        value: 'PRICE_PRIORITY',
        key: 'PRICE_PRIORITY',
        isMandatory: true
    },
    {
        name: 'Sponsorship',
        value: 'SPONSORSHIP',
        key: 'SPONSORSHIP'
    },
    {
        name: 'Standard',
        value: 'STANDARD',
        key: 'STANDARD'
    },
    {
        name: 'Network',
        value: 'NETWORK',
        key: 'NETWORK'
    },
    {
        name: 'Bulk',
        value: 'BULK',
        key: 'BULK'
    },
    {
        name: 'House',
        value: 'HOUSE',
        key: 'HOUSE',
    },
    {
        name: 'Adsense',
        value: 'ADSENSE',
        key: 'ADSENSE'
    },
    {
        name: 'Custom',
        value: 'CUSTOM', // can be added in ntwk doc manually for any manual addition of line items
        key: 'CUSTOM',
        isDisabled: true,
        isMandatory: true
    }
];

module.exports = {
    LINE_ITEM_TYPES
};