// Used in client as well

const LINE_ITEM_TYPES = [
    {
        name: 'Ad Exchange',
        value: 'AD_EXCHANGE',
        key: 'AD_EXCHANGE',
        isMandatory: true,
        toBeFetchedFromGAM: true,
        groupedSeperatelyInScript: false
    },
    {
        name: 'Price Priority',
        value: 'PRICE_PRIORITY',
        key: 'PRICE_PRIORITY',
        isMandatory: true,
        toBeFetchedFromGAM: true,
        groupedSeperatelyInScript: false
    },
    {
        name: 'Sponsorship',
        value: 'SPONSORSHIP',
        key: 'SPONSORSHIP',
        toBeFetchedFromGAM: true,
        groupedSeperatelyInScript: false
    },
    {
        name: 'Standard',
        value: 'STANDARD',
        key: 'STANDARD',
        toBeFetchedFromGAM: true,
        groupedSeperatelyInScript: false
    },
    {
        name: 'Network',
        value: 'NETWORK',
        key: 'NETWORK',
        toBeFetchedFromGAM: true,
        groupedSeperatelyInScript: false
    },
    {
        name: 'Bulk',
        value: 'BULK',
        key: 'BULK',
        toBeFetchedFromGAM: true,
        groupedSeperatelyInScript: false
    },
    {
        name: 'House',
        value: 'HOUSE',
        key: 'HOUSE',
        toBeFetchedFromGAM: true,
        groupedSeperatelyInScript: false
    },
    {
        name: 'Adsense',
        value: 'ADSENSE',
        key: 'ADSENSE',
        toBeFetchedFromGAM: true,
        groupedSeperatelyInScript: false
    },
    {
        name: 'Custom',
        value: 'CUSTOM', // can be added in ntwk doc manually for any manual addition of line items
        key: 'CUSTOM',
        isDisabled: true,
        isMandatory: true,
        toBeFetchedFromGAM: false,
        groupedSeperatelyInScript: false
    },
    {
        name: 'Header Bidding',
        value: 'HEADER_BIDDING', // can be added in ntwk doc manually for any manual addition of line items
        key: 'HEADER_BIDDING',
        isMandatory: true,
        toBeFetchedFromGAM: false, // These are fetched in PRICE_PRIORITY
        groupedSeperatelyInScript: true
    }
];

module.exports = {
    LINE_ITEM_TYPES
};