// Used in client as well
// isDisabled is for 

const LINE_ITEM_TYPES = [
    {
        name: 'Ad Exchange',
        value: 'AD_EXCHANGE',
        key: 'AD_EXCHANGE',
        isMandatory: true,
        toBeFetchedFromGAM: true,
    },
    {
        name: 'Price Priority',
        value: 'PRICE_PRIORITY',
        key: 'PRICE_PRIORITY',
        isMandatory: true,
        toBeFetchedFromGAM: true,
    },
    {
        name: 'Sponsorship',
        value: 'SPONSORSHIP',
        key: 'SPONSORSHIP',
        toBeFetchedFromGAM: true,
    },
    {
        name: 'Standard',
        value: 'STANDARD',
        key: 'STANDARD',
        toBeFetchedFromGAM: true,
    },
    {
        name: 'Network',
        value: 'NETWORK',
        key: 'NETWORK',
        toBeFetchedFromGAM: true,
    },
    {
        name: 'Bulk',
        value: 'BULK',
        key: 'BULK',
        toBeFetchedFromGAM: true,
    },
    {
        name: 'House',
        value: 'HOUSE',
        key: 'HOUSE',
        toBeFetchedFromGAM: true,
    },
    {
        name: 'Adsense',
        value: 'ADSENSE',
        key: 'ADSENSE',
        toBeFetchedFromGAM: true,
    },
    {
        name: 'Custom',
        value: 'CUSTOM', // can be added in ntwk doc manually for any manual addition of line items
        key: 'CUSTOM',
        isDisabled: true,
        isMandatory: true,
        toBeFetchedFromGAM: false,
    },
    {
        name: 'Header Bidding',
        value: 'HEADER_BIDDING', // can be added in ntwk doc manually for any manual addition of line items
        key: 'HEADER_BIDDING',
        isDisabled: true, // Its disabled so that its not visible in UI. It will be added to the lineitem list in generateAdNetworkConfig
        isMandatory: true,
        groupedSeparately: true,
        toBeFetchedFromGAM: false, // These are fetched in PRICE_PRIORITY
    }
];

module.exports = {
    LINE_ITEM_TYPES
};