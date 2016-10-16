const status = {
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
		PREPARE_IN_CONTENT_AREA: 'PREPARE_IN_CONTENT_AREA',
		SCROLL_SECTION_TO_SCREEN: 'SCROLL_SECTION_TO_SCREEN',
		TRY_EDITING_XPATH: 'TRY_EDITING_XPATH',
		SECTION_XPATH_MISSING: 'SECTION_XPATH_MISSING',
		UPDATE_LAYOUT: 'UPDATE_LAYOUT'
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

		EDIT_SAMPLE_URL: 'EDIT_SAMPLE_URL',
		CHANGE_CONTENT_SELECTOR: 'CHANGE_CONTENT_SELECTOR',
		EDIT_CONTENT_SELECTOR: 'EDIT_CONTENT_SELECTOR',
		SAVE_BEFORE_AFTER_JS: 'SAVE_BEFORE_AFTER_JS'

	},
	insertMenuActions = {
		HIDE_MENU: 'HIDE_MENU',
		SHOW_MENU: 'SHOW_MENU'
	},
	editMenuActions = {
		HIDE_EDIT_MENU: 'HIDE_EDIT_MENU',
		SHOW_EDIT_MENU: 'SHOW_EDIT_MENU'
	},
	variationActions = {
		ADD_VARIATION: 'ADD_VARIATION',
		COPY_VARIATION: 'COPY_VARIATION',
		DELETE_VARIATION: 'DELETE_VARIATION',
		PAUSE_VARIATION: 'PAUSE_VARIATION',
		RESUME_VARIATION: 'RESUME_VARIATION',
		UPDATE_VARIATION: 'UPDATE_VARIATION',
		SET_ACTIVE_VARIATION: 'SET_ACTIVE_VARIATION'
	},
	sectionActions = {
		CREATE_SECTION: 'CREATE_SECTION',
		DELETE_SECTION: 'DELETE_SECTION',
		SCROLL_SECTION_TO_SCREEN: 'SCROLL_SECTION_TO_SCREEN',
		HANDLE_ALL_XPATHS: 'HANDLE_ALL_XPATHS',
		RENAME_SECTION: 'RENAME_SECTION'
	},
	adActions = {
		CREATE_AD: 'CREATE_AD',
		DELETE_AD: 'DELETE_AD',
		UPDATE_ADCODE: 'UPDATE_ADCODE',
		UPDATE_CSS: 'UPDATE_CSS'
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
		SET_ADP_ELEMENT: 'SET_ADP_ELEMENT'
	},
	commonSupportedSizes = [
		{
			layoutType: 'SQUARE',
			sizes: [{ width: 336, height: 280 }, { width: 300, height: 250 }, { width: 250, height: 250 }, { width: 200, height: 200 }]
		},
		{
			layoutType: 'HORIZONTAL',
			sizes: [{ width: 900, height: 90 }, { width: 728, height: 90 }, { width: 468, height: 60 }, { width: 970, height: 250 }]
		},
		{
			layoutType: 'VERTICAL',
			sizes: [{ width: 300, height: 600 }, { width: 160, height: 600 }, { width: 120, height: 600 }, { width: 300, height: 1050 }]
		},
		{
			layoutType: 'MOBILE',
			sizes: [{ width: 320, height: 100 }, { width: 320, height: 50 }, { width: 300, height: 250 }, { width: 250, height: 250 }, { width: 200, height: 200 }]
		},
		{
			layoutType: 'CUSTOM',
			sizes: []
		}
	],
	defaultSectionCss = { 'margin-left': 'auto', 'margin-right': 'auto', 'margin-top': '0px', 'margin-bottom': '0px', clear: 'both' };

export {
	status, proxy, stores, adTypes, messengerCommands, siteModes,
	siteActions, channelActions, sectionActions, adActions,
	insertMenuActions, editMenuActions,
	adBoxSizeStyles, commonSupportedSizes, variationActions,
	hbBoxActions, innerVariationActions, innerActions,
	defaultSectionCss
};

