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
			name: 'geniee'
		}
	},
	proxy = {
		HTTP_PROXY_URL: `${window.ADP_ORIGIN}/loadFromApProxy/`,
		SIMULATED_PROXY_URL: `${window.ADP_BASEURL}/proxy/loadPage`
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
        SCROLL_TO_VIEW: 'SCROLL_TO_VIEW'
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
		CONTENT_SELECTOR_WORKED: 'CONTENT_SELECTOR_WORKED'

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
        SHRINK_VARIATION_PANEL: 'SHRINK_VARIATION_PANEL'
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
		GET_ALL_XPATHS: 'GET_ALL_XPATHS',
		VALIDATE_XPATH: 'VALIDATE_XPATH',
		VALIDATE_XPATH_SECTION: 'VALIDATE_XPATH_SECTION',
        UPDATE_INCONTENT_FLOAT: 'UPDATE_INCONTENT_FLOAT',
        SCROLL_TO_VIEW: 'SCROLL_TO_VIEW'
	},
	adActions = {
		CREATE_AD: 'CREATE_AD',
		DELETE_AD: 'DELETE_AD',
		UPDATE_ADCODE: 'UPDATE_ADCODE',
		UPDATE_CSS: 'UPDATE_CSS',
		UPDATE_NETWORK: 'UPDATE_NETWORK'
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
	},
	uiActions = {
		RESET_ERRORS: 'RESET_ERRORS',
		UPDATE_AFTER_SAVE_STATUS: 'UPDATE_AFTER_SAVE_STATUS'
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
			sizes: [{ width: 300, height: 250 }, { width: 250, height: 250 }, { width: 200, height: 200 }]
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
			sizes: [{ width: 320, height: 50 }, { width: 300, height: 250 }, { width: 250, height: 250 }, { width: 200, height: 200 }]
		},
		{
			layoutType: 'CUSTOM',
			sizes: []
		}
	],
	nonPartnerAdSizes = [
		{
			layoutType: 'SQUARE',
			sizes: [{ width: 336, height: 280 }]
		},
		{
			layoutType: 'HORIZONTAL',
			sizes: [{ width: 900, height: 90 }, { width: 970, height: 250 }]
		},
		{
			layoutType: 'VERTICAL',
			sizes: [{ width: 300, height: 1050 }]
		},
		{
			layoutType: 'MOBILE',
			sizes: [{ width: 320, height: 100 }]
		}
	],
	defaultSectionCss = { 'margin-left': 'auto', 'margin-right': 'auto', 'margin-top': '0px', 'margin-bottom': '0px', clear: 'both' },
	leftSectionCss = { float: 'left', 'margin-left': '0px', 'margin-right': '5px', 'margin-top': '0px', 'margin-bottom': '5px' },
	rightSectionCss = { float: 'right', 'margin-left': '5px', 'margin-right': '0px', 'margin-top': '0px', 'margin-bottom': '5px' };

export {
	status, proxy, stores, adTypes, messengerCommands, siteModes,
	siteActions, channelActions, sectionActions, adActions,
	insertMenuActions, editMenuActions, newChannelMenuActions,
	adBoxSizeStyles, commonSupportedSizes, nonPartnerAdSizes, variationActions,
	hbBoxActions, innerVariationActions, innerActions,
	defaultSectionCss, leftSectionCss, rightSectionCss,
	components, siteModesPopoverActions, channelMenuActions,
	uiActions, ui, uiCollections, floats, partners
};
