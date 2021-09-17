// Used in client as well
// Flags:
// isDisabled: If set to true, type would not be visible in UI
// isMandatory: If set to true, the type will be become mandatory and auto enabled network wide
// toBeFetchedFromGAM: If set to true, the type will be fetched from GAM by adManagerSyncService. Its set to false for line item types like custom and header bidding (custom types)
// groupedSeparately: If set to true, its line items would not be in adpushup.config.lineItems but they would be grouped separately in adpushup.config.separatelyGroupedLineItems

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
        isDisabled: true, // Its disabled so that its not visible in UI. It will be added to the separatelyGroupedLineItems in generateAdNetworkConfig
        isMandatory: true,
        groupedSeparately: true,
        toBeFetchedFromGAM: false, // These are fetched in PRICE_PRIORITY
    }
];

module.exports = {
    LINE_ITEM_TYPES
};