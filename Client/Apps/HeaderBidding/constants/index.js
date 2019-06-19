export const LINK_TYPE = {
	INAPP: 'INAPP',
	OUTWARD: 'OUTWARD',
	NOOP: 'NOOP'
};

export const TYPE = {
	LINK: 'LINK',
	TEXT: 'TEXT'
};

export const DEFAULT_ITEM = {
	type: TYPE.TEXT,
	text: 'Status: __STATUS__'
};

export const NAV_ITEMS_INDEXES = {
	TAB_1: 'setup',
	TAB_2: 'bidders',
	TAB_3: 'inventory',
	TAB_4: 'prebid-settings',
	TAB_5: 'optimization'
};

export const NAV_ITEMS_VALUES = {
	TAB_1: 'Setup',
	TAB_2: 'Bidders',
	TAB_3: 'Inventory',
	TAB_4: 'Prebid Settings',
	TAB_5: 'Optimization'
};

export const NAV_ITEMS = {
	[NAV_ITEMS_INDEXES.TAB_1]: {
		NAME: [NAV_ITEMS_VALUES.TAB_1],
		INDEX: 1
	},
	[NAV_ITEMS_INDEXES.TAB_2]: {
		NAME: [NAV_ITEMS_VALUES.TAB_2],
		INDEX: 2
	},
	[NAV_ITEMS_INDEXES.TAB_3]: {
		NAME: [NAV_ITEMS_VALUES.TAB_3],
		INDEX: 3
	},
	[NAV_ITEMS_INDEXES.TAB_4]: {
		NAME: [NAV_ITEMS_VALUES.TAB_4],
		INDEX: 4
	},
	[NAV_ITEMS_INDEXES.TAB_5]: {
		NAME: [NAV_ITEMS_VALUES.TAB_5],
		INDEX: 5
	}
};
