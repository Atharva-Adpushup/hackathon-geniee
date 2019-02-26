const status = {
	text: {
		SUCCESS: 'SUCCESS',
		PENDING: 'PENDING',
		FAILED: 'FAILED',
		LOADING: 'LOADING',
		RESET: 'RESET'
	},
	RESET: 0,
	PENDING: 1,
	SUCCESS: 2,
	FAILED: 3,
	LOADING: 4,
	NOT_LOADED: 5,
	LOADED: 6,
	ARCHIVED: 7,
	ACTIVE: 8,
	PAUSED: 9,
	FALSE: false,
	TRUE: true
},
	partners = {
		geniee: {
			name: 'geniee',
			networks: {
				disabled: ['adpTags', 'medianet']
			}
		},
		list: ['geniee']
	},
	proxy = {
		HTTP_PROXY_URL: `${window.ADP_ORIGIN}/loadFromApProxy/`,
		SIMULATED_PROXY_URL: `${window.ADP_BASEURL}/proxy/loadPage`,
		EXTENSION_ID: 'nbbbgcccgkkkemfmbjmbelkcgjlpibon' //'jpncecfhenibcencdmcpkeplacnhpcpp'
	},
	stores = {
		SITE_STORE: 'siteStore',
		SECTION_STORE: 'sectionStore',
		CHANNEL_STORE: 'channelStore',
		VARIATION_STORE: 'variationStore',
		UI_STORE: 'uiStore'
	},
	adBoxSizeStyles = {
		background: '#eb575c !important',
		borderRadius: '3px !important',
		color: '#fff !important',
		fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif !important",
		fontSize: '12px !important',
		fontWeight: '400 !important',
		left: '5px !important',
		padding: '4px !important',
		position: 'absolute !important',
		top: '5px !important'
	},
	adTypes = {
		TEXT_IMAGE: 'text_image',
		TEXT: 'text',
		IMAGE: 'image'
	},
	floats = ['none', 'left', 'right'],
	messengerCommands = {
		SHOW_INSERT_CONTEXTMENU: 'SHOW_INSERT_CONTEXTMENU',
		SHOW_EDIT_CONTEXTMENU: 'SHOW_EDIT_CONTEXTMENU',
		ACTIVE_ELEMENT_INFO: 'ACTIVE_ELEMENT_INFO',
		HIDE_CONTEXTMENU: 'HIDE_CONTEXTMENU',
		HIGHLIGHT_ELEMENT: 'HIGHLIGHT_ELEMENT',
		LAST_AD_VITALS: 'LAST_AD_VITALS',
		SELECT_ELEMENT: 'SELECT_ELEMENT',
		INSERT_AD: 'INSERT_AD',
		HIDE_AD: 'HIDE_AD',
		REMOVE_AD: 'REMOVE_AD',
		UPDATE_AD_SIZE: 'UPDATE_AD_SIZE',
		GET_SECTION_ALTERNATE_XPATHS: 'GET_SECTION_ALTERNATE_XPATHS',
		REMOVE_SECTION: 'REMOVE_SECTION',
		SECTION_ALL_XPATHS: 'SECTION_ALL_XPATHS',
		CM_FRAMELOAD_SUCCESS: 'CM_FRAMELOAD_SUCCESS',
		CHANGE_EDITOR_MODE: 'CHANGE_EDITOR_MODE',
		APPLY_CSS: 'APPLY_CSS',
		HIGHLIGHT_ADBOX: 'HIGHLIGHT_ADBOX',
		SCROLL_SECTION_TO_SCREEN: 'SCROLL_SECTION_TO_SCREEN',
		TRY_EDITING_XPATH: 'TRY_EDITING_XPATH',
		SECTION_XPATH_MISSING: 'SECTION_XPATH_MISSING',
		UPDATE_LAYOUT: 'UPDATE_LAYOUT',
		HIDE_ELEMENT_SELECTOR: 'HIDE_ELEMENT_SELECTOR',
		CONTENT_SELECTOR_MISSING: 'CONTENT_SELECTOR_MISSING',
		CONTENT_SELECTOR_WORKED: 'CONTENT_SELECTOR_WORKED',
		GET_RELEVANT_XPATHS: 'GET_RELEVANT_XPATHS',
		SET_RELEVANT_XPATHS: 'SET_RELEVANT_XPATHS',
		VALIDATE_XPATH: 'VALIDATE_XPATH',
		XPATH_VALIDATED: 'XPATH_VALIDATED',
		VALIDATE_XPATH_SECTION: 'VALIDATE_XPATH_SECTION',
		XPATH_SECTION_VALIDATED: 'XPATH_SECTION_VALIDATED',
		SCROLL_TO_VIEW: 'SCROLL_TO_VIEW',
		SET_MODE: 'SET_MODE'
	},
	siteModes = {
		DRAFT: 2,
		PUBLISH: 1
	},
	siteActions = {
		LOAD_SITE_START: 'LOAD_SITE_START',
		LOAD_SITE: 'LOAD_SITE', // From Server
		LOAD_SITE_SUCCESS: 'LOAD_SITE_SUCCESS', // From Server
		LOAD_SITE_FAILURE: 'LOAD_SITE_FAILURE', // From Server
		CREATE_SITE: 'CREATE_SITE',
		CREATE_DEFAULTS: 'CREATE_DEFAULTS',
		ADD_AUDIENCE: 'ADD_AUDIENCE',
		LOAD_AUDIENCES: 'LOAD_AUDIENCES',
		LOAD_CMS_INFO: 'LOAD_CMS_INFO',
		SET_ACTIVE_AUDIENCE: 'SET_ACTIVE_AUDIENCE',
		MODIFY_AUDIENCE: 'MODIFY_AUDIENCE',
		MASTER_SAVE: 'MASTER_SAVE',
		MASTER_SAVE_SUCCESS: 'MASTER_SAVE_SUCCESS',
		MASTER_SAVE_FAIL: 'MASTER_SAVE_FAIL',
		RESET_SAVE_STATUS: 'RESET_SAVE_STATUS',
		LOAD_ADNETWORKS: 'LOAD_ADNETWORKS',
		CHANGE_SITE_MODE: 'CHANGE_SITE_MODE',
		CHANGE_AP_CONFIGS: 'CHANGE_AP_CONFIGS'
	},
	channelActions = {
		LOAD_CHANNEL: 'LOAD_CHANNEL',
		UNLOAD_CHANNEL: 'UNLOAD_CHANNEL',
		UNLOAD_CHANNELS_SUCCESS: 'UNLOAD_CHANNELS_SUCCESS',

		SHOW_LOADER: 'SHOW_LOADER',
		HIDE_LOADER: 'HIDE_LOADER',

		DELETE_CHANNEL: 'DELETE CHANNEL', // From Sever
		DELETE_CHANNEL_SUCCESS: 'DELETE_CHANNEL_SUCCESS',
		DELETE_CHANNEL_FAIL: 'DELETE_CHANNEL_FAIL',

		CREATE_CHANNEL: 'CREATE_CHANNEL',
		UPDATE_CHANNEL: 'UPDATE_CHANNEL',

		OPEN_CHANNEL: 'OPEN_CHANNEL',
		OPEN_CHANNEL_SUCCESS: 'OPEN_CHANNEL_SUCCESS',
		OPEN_CHANNEL_FAIL: 'OPEN_CHANNEL_FAIL',

		CLOSE_CHANNEL: 'CLOSE_CHANNEL',

		SET_ACTIVE_CHANNEL: 'SET_ACTIVE_CHANNEL',

		SAVE_SAMPLE_URL: 'SAVE_SAMPLE_URL',
		CHANGE_CONTENT_SELECTOR: 'CHANGE_CONTENT_SELECTOR',
		EDIT_CONTENT_SELECTOR: 'EDIT_CONTENT_SELECTOR',
		SAVE_BEFORE_AFTER_JS: 'SAVE_BEFORE_AFTER_JS',
		CONTENT_SELECTOR_MISSING: 'CONTENT_SELECTOR_MISSING',
		CONTENT_SELECTOR_WORKED: 'CONTENT_SELECTOR_WORKED',
		UPDATE_AUTOPTIMIZE: 'UPDATE_AUTOPTIMIZE'
	},
	insertMenuActions = {
		HIDE_MENU: 'HIDE_MENU',
		SHOW_MENU: 'SHOW_MENU'
	},
	editMenuActions = {
		HIDE_EDIT_MENU: 'HIDE_EDIT_MENU',
		SHOW_EDIT_MENU: 'SHOW_EDIT_MENU'
	},
	newChannelMenuActions = {
		HIDE_NEW_CHANNEL_MENU: 'HIDE_NEW_CHANNEL_MENU',
		SHOW_NEW_CHANNEL_MENU: 'SHOW_NEW_CHANNEL_MENU'
	},
	channelMenuActions = {
		HIDE_CHANNEL_MENU: 'HIDE_CHANNEL_MENU',
		SHOW_CHANNEL_MENU: 'SHOW_CHANNEL_MENU'
	},
	siteModesPopoverActions = {
		SHOW_SITE_MODES_POPOVER: 'SHOW_SITE_MODES_POPOVER',
		HIDE_SITE_MODES_POPOVER: 'HIDE_SITE_MODES_POPOVER'
	},
	variationActions = {
		ADD_VARIATION: 'ADD_VARIATION',
		COPY_VARIATION: 'COPY_VARIATION',
		DELETE_VARIATION: 'DELETE_VARIATION',
		PAUSE_VARIATION: 'PAUSE_VARIATION',
		RESUME_VARIATION: 'RESUME_VARIATION',
		UPDATE_VARIATION: 'UPDATE_VARIATION',
		SET_ACTIVE_VARIATION: 'SET_ACTIVE_VARIATION',
		EDIT_VARIATION_NAME: 'EDIT_VARIATION_NAME',
		EDIT_TRAFFIC_DISTRIBUTION: 'EDIT_TRAFFIC_DISTRIBUTION',
		SAVE_BEFORE_JS: 'SAVE_BEFORE_JS',
		SAVE_AFTER_JS: 'SAVE_AFTER_JS',
		EXPAND_VARIATION_PANEL: 'EXPAND_VARIATION_PANEL',
		SHRINK_VARIATION_PANEL: 'SHRINK_VARIATION_PANEL',
		TOGGLE_VARIATION_PANEL: 'TOGGLE_VARIATION_PANEL',
		OPEN_VARIATION_PANEL: 'OPEN_VARIATION_PANEL',
		CLOSE_VARIATION_PANEL: 'CLOSE_VARIATION_PANEL',
		UPDATE_CONTENT_SELECTOR: 'UPDATE_CONTENT_SELECTOR',
		UPDATE_INCONTENT_SELECTORS_TREE_LEVEL: 'UPDATE_INCONTENT_SELECTORS_TREE_LEVEL',
		SAVE_KEY_VALUES: 'SAVE_KEY_VALUES',
		SAVE_PERSONALIZATION_INFO: 'SAVE_PERSONALIZATION_INFO',
		DISABLE_VARIATION: 'DISABLE_VARIATION',
		TAG_CONTROL_VARIATION: 'TAG_CONTROL_VARIATION'
	},
	sectionActions = {
		CREATE_SECTION: 'CREATE_SECTION',
		CREATE_INCONTENT_SECTION: 'CREATE_INCONTENT_SECTION',
		DELETE_SECTION: 'DELETE_SECTION',
		SCROLL_SECTION_TO_SCREEN: 'SCROLL_SECTION_TO_SCREEN',
		HANDLE_ALL_XPATHS: 'HANDLE_ALL_XPATHS',
		RENAME_SECTION: 'RENAME_SECTION',
		UPDATE_PARTNER_DATA: 'UPDATE_PARTNER_DATA',
		UPDATE_XPATH: 'UPDATE_XPATH',
		UPDATE_INCONTENT_MIN_DISTANCE_FROM_PREV_AD: 'UPDATE_INCONTENT_MIN_DISTANCE_FROM_PREV_AD',
		GET_ALL_XPATHS: 'GET_ALL_XPATHS',
		VALIDATE_XPATH: 'VALIDATE_XPATH',
		VALIDATE_XPATH_SECTION: 'VALIDATE_XPATH_SECTION',
		UPDATE_INCONTENT_FLOAT: 'UPDATE_INCONTENT_FLOAT',
		SCROLL_TO_VIEW: 'SCROLL_TO_VIEW',
		UPDATE_TYPE: 'UPDATE_TYPE',
		ENABLE_LAZYLOAD: 'ENABLE_LAZYLOAD',
		UPDATE_FORMAT_DATA: 'UPDATE_FORMAT_DATA',
		UPDATE_SECTION: 'UPDATE_SECTION',
		UPDATE_OPERATION: 'UPDATE_OPERATION'
	},
	adActions = {
		CREATE_AD: 'CREATE_AD',
		DELETE_AD: 'DELETE_AD',
		UPDATE_ADCODE: 'UPDATE_ADCODE',
		UPDATE_CSS: 'UPDATE_CSS',
		UPDATE_CUSTOM_CSS: 'UPDATE_CUSTOM_CSS',
		UPDATE_NETWORK: 'UPDATE_NETWORK',
		UPDATE_AD: 'UPDATE_AD',
		UPDATE_LOG_WRITTEN: 'UPDATE_LOG_WRITTEN'
	},
	adInsertOptions = {
		INSERT_BEFORE: 'Insert Before',
		INSERT_AFTER: 'Insert After',
		PREPEND: 'Prepend',
		APPEND: 'Append'
	},
	hbBoxActions = {
		HIDE_HB_BOX: 'HIDE_HB_BOX',
		SHOW_HB_BOX: 'SHOW_HB_BOX'
	},
	innerVariationActions = {
		UPDATE_VARIATION: 'UPDATE_VARIATION',
		DELETE_AD: 'DELETE_AD',
		DELETE_SECTION: 'DELETE_SECTION'
	},
	innerActions = {
		HIDE_ELEMENT_SELECTOR: 'HIDE_ELEMENT_SELECTOR',
		SET_ELEMENT_SELECTOR_CORDS: 'SET_ELEMENT_SELECTOR_CORDS',
		UPDATE_CONTENT_OVERLAY: 'UPDATE_CONTENT_OVERLAY',
		SET_MODE: 'SET_MODE'
	},
	uiActions = {
		RESET_ERRORS: 'RESET_ERRORS',
		UPDATE_AFTER_SAVE_STATUS: 'UPDATE_AFTER_SAVE_STATUS',
		SET_MODE: 'SET_MODE',
		SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
		HIDE_NOTIFICATION: 'HIDE_NOTIFICATION'
	},
	reportingActions = {
		SET_REPORT: 'SET_REPORT',
		GET_REPORT: 'GET_REPORT'
	},
	components = {
		INSERT_CONTEXTMENU: 'INSERT_CONTEXTMENU',
		EDIT_CONTEXTMENU: 'EDIT_CONTEXTMENU',
		MISC_MENU: 'MISC_MENU',
		NEW_CHANNEL_MENU: 'NEW_CHANNEL_MENU',
		CHANNEL_MENU: 'CHANNEL_MENU',
		PUBLISH_HELPER: 'PUBLISH_HELPER',
		PAGE_GROUP_GUIDER: 'PAGE_GROUP_GUIDER',
		AD_INSERTION_GUIDER: 'AD_INSERTION_GUIDER',
		CONTROL_CONVERSION_GUIDER: 'CONTROL_CONVERSION_GUIDER',
		OAUTH_GUIDER: 'OAUTH_GUIDER',
		ADPUSHUP_INSTALLATION_GUIDER: 'ADPUSHUP_INSTALLATION_GUIDER',
		HELP_TRIGGER: 'HELP_TRIGGER',
		CODE_EDITOR: 'CODE_EDITOR',
		FAQ: 'FAQ',
		NETWORK_MANAGER: 'NETWORK_MANAGER',
		SECTION_MANAGER: 'SECTION_MANAGER'
	},
	ui = {
		components: {
			collections: {
				trafficDistribution: {
					errorMessage: {
						sumMismatch: ['The total traffic allocation for all variations must equal ']
					},
					description: 'Specify the traffic you want to set for each variation in the page group:'
				}
			}
		}
	},
	uiCollections = ui.components.collections,
	commonSupportedSizes = [
		{
			layoutType: 'SQUARE',
			sizes: [
				{ width: 300, height: 250 },
				{ width: 250, height: 250 },
				{ width: 200, height: 200 },
				{ width: 336, height: 280 }
			]
		},
		{
			layoutType: 'HORIZONTAL',
			sizes: [{ width: 728, height: 90 }, { width: 468, height: 60 }]
		},
		{
			layoutType: 'VERTICAL',
			sizes: [{ width: 300, height: 600 }, { width: 160, height: 600 }, { width: 120, height: 600 }]
		},
		{
			layoutType: 'MOBILE',
			sizes: [
				{ width: 320, height: 50 },
				{ width: 300, height: 250 },
				{ width: 250, height: 250 },
				{ width: 200, height: 200 },
				{ width: 320, height: 100 }
			]
		},
		{
			layoutType: 'RESPONSIVE',
			sizes: [{ width: 'responsive', height: 'responsive' }]
		}
	],
	nonPartnerAdSizes = [
		{
			layoutType: 'HORIZONTAL',
			sizes: [{ width: 900, height: 90 }, { width: 970, height: 250 }]
		},
		{
			layoutType: 'VERTICAL',
			sizes: [{ width: 300, height: 1050 }]
		}
	],
	defaultSectionCss = {
		'margin-left': 'auto',
		'margin-right': 'auto',
		'margin-top': '0px',
		'margin-bottom': '0px',
		clear: 'both'
	},
	leftSectionCss = {
		float: 'left',
		'margin-left': '0px',
		'margin-right': '5px',
		'margin-top': '0px',
		'margin-bottom': '5px'
	},
	rightSectionCss = {
		float: 'right',
		'margin-left': '5px',
		'margin-right': '0px',
		'margin-top': '0px',
		'margin-bottom': '5px'
	},
	uiModes = {
		EDITOR_MODE: 1,
		BROWSE_MODE: 2
	},
	networks = ['adsense', 'adpTags', 'custom', 'geniee', 'medianet'],
	priceFloorKeys = ['FP_S_A', 'FP_B_A', 'FP_S', 'FP_A', 'FP_B'],
	defaultPriceFloorKey = 'FP_S_A',
	reportingUrl = '/user/reports/generate',
	jsWrapper = `(function($){ \n\n })(adpushup.$)`,
	interactiveAds = {
		events: ['DOMContentLoaded', 'scriptLoaded'], //load', 'scroll', 'onMills',
		sizes: {
			DESKTOP: {
				sticky: {
					top: ['300x50', '300x100', '320x100', '728x90'],
					bottom: ['300x50', '300x100', '320x100', '728x90'],
					left: ['160x600', '336x280', '300x250', '300x600', '300x50', '120x600'],
					right: ['160x600', '336x280', '300x250', '300x600', '300x50', '120x600']
				},
				video: {
					custom: ['336x280']
				}
			},
			MOBILE: {
				sticky: {
					top: ['336x280', '300x250', '300x50', '320x100', '300x100', '320x50'],
					bottom: ['336x280', '300x250', '300x50', '320x100', '300x100', '320x50']
				},
				video: {
					custom: ['336x280']
				}
			},
			TABLET: {
				sticky: {
					top: ['336x280', '300x250', '300x50', '320x100', '300x100', '320x50', '728x90'],
					bottom: ['336x280', '300x250', '300x50', '320x100', '300x100', '320x50', '728x90']
				},
				video: {
					custom: ['336x280']
				}
			}
		},
		types: {
			DESKTOP: ['stickyTop', 'stickyBottom', 'stickyLeft', 'stickyRight'],
			MOBILE: ['stickyTop', 'stickyBottom'],
			TABLET: ['stickyTop', 'stickyBottom', 'stickyLeft', 'stickyRight']
		}
	},
	personalizationTypes = ['not', 'in'],
	typeOfAds = {
		STRUCTURAL: 1,
		IN_CONTENT: 2,
		INTERACTIVE_AD: 3,
		DOCKED_STRUCTURAL: 4,
		EXTERNAL_TRIGGER_AD: 5,
		LAZYLOAD_STRUCTURAL: 6
	},
	iabSizes = {
		ALL: [
			[120, 600],
			[160, 600],
			[200, 200],
			[240, 400],
			[250, 250],
			[300, 50],
			[300, 100],
			[300, 250],
			[300, 600],
			[320, 50],
			[320, 100],
			[320, 480],
			[336, 280],
			[468, 60],
			[480, 320],
			[720, 300],
			[728, 90],
			[728, 250],
			[728, 280],
			[900, 90],
			[970, 90],
			[970, 250],
			['responsive', 'responsive']
		],
		MULTIPLE_AD_SIZES_WIDTHS_MAPPING: {
			'300': [[300, 50], [300, 100], [300, 250], [300, 600]],
			'320': [[320, 50], [320, 100], [320, 480]],
			'728': [[728, 90], [728, 250], [728, 280]],
			'970': [[970, 90], [970, 250]]
		},
		// The backward compatible size array for every ad size contains itself as well
		BACKWARD_COMPATIBLE_MAPPING: {
			// MOBILE sizes
			'120,600': [[120, 600]],
			'160,600': [[120, 600], [160, 600]],
			'200,200': [[200, 200]],
			'240,400': [[200, 200], [240, 400]],
			'250,250': [[200, 200], [250, 250]],
			'300,50': [[300, 50]],
			'300,100': [[300, 50], [300, 100]],
			'300,250': [[300, 250]],
			'300,600': [[160, 600], [300, 250], [300, 600]],
			'320,50': [[320, 50]],
			'320,100': [[320, 50], [320, 100]],
			'320,480': [[300, 250], [320, 50], [320, 100], [320, 480]],
			'336,280': [[300, 250], [336, 280]],
			// TABLET sizes
			'468,60': [[468, 60]],
			'480,320': [[250, 250], [300, 250], [320, 50], [320, 100], [336, 280], [468, 60], [480, 320]],
			// DESKTOP sizes
			'720,300': [[300, 250], [336, 280], [720, 300]],
			'728,90': [[728, 90]],
			'728,250': [[300, 250], [728, 90], [728, 250]],
			'728,280': [[300, 250], [336, 280], [728, 90], [728, 250], [728, 280]],
			'900,90': [[728, 90], [900, 90]],
			'970,90': [[728, 90], [900, 90], [970, 90]],
			'970,250': [[300, 250], [728, 90], [728, 250], [900, 90], [970, 90], [970, 250]],
			// RESPONSIVE size
			'responsive,responsive': [
				[120, 600],
				[160, 600],
				[200, 200],
				[240, 400],
				[250, 250],
				[300, 50],
				[300, 100],
				[300, 250],
				[300, 600],
				[320, 50],
				[320, 100],
				[320, 480],
				[336, 280],
				[468, 60],
				[480, 320],
				[720, 300],
				[728, 90],
				[728, 250],
				[728, 280],
				[900, 90],
				[970, 90],
				[970, 250]
			]
		}
	},
	incontentSections = {
		SELECTORS_TREE_LEVEL: ['any', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
	},
	refreshIntervals = [30, 45, 60, 75, 90, 105, 120];

export {
	status,
	proxy,
	stores,
	adTypes,
	messengerCommands,
	siteModes,
	siteActions,
	channelActions,
	sectionActions,
	adActions,
	adInsertOptions,
	insertMenuActions,
	editMenuActions,
	newChannelMenuActions,
	adBoxSizeStyles,
	commonSupportedSizes,
	nonPartnerAdSizes,
	variationActions,
	hbBoxActions,
	innerVariationActions,
	innerActions,
	defaultSectionCss,
	leftSectionCss,
	rightSectionCss,
	components,
	siteModesPopoverActions,
	channelMenuActions,
	uiActions,
	ui,
	uiCollections,
	floats,
	partners,
	uiModes,
	networks,
	reportingActions,
	reportingUrl,
	priceFloorKeys,
	defaultPriceFloorKey,
	jsWrapper,
	interactiveAds,
	personalizationTypes,
	typeOfAds,
	iabSizes,
	incontentSections,
	refreshIntervals
};
