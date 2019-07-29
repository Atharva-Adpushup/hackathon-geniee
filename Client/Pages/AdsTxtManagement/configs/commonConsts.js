const ADSTXT_NAV_ITEMS_INDEXES = {
	AUTHENTICATOR: 'authenticator',
	ENTRIES: 'entries'
};

const ADSTXT_NAV_ITEMS_VALUES = {
	AUTHENTICATOR: 'Authenticator',
	ENTRIES: 'Entries'
};

const ADSTXT_NAV_ITEMS = {
	[ADSTXT_NAV_ITEMS_INDEXES.AUTHENTICATOR]: {
		NAME: [ADSTXT_NAV_ITEMS_VALUES.AUTHENTICATOR],
		INDEX: 1
	},
	[ADSTXT_NAV_ITEMS_INDEXES.ENTRIES]: {
		NAME: [ADSTXT_NAV_ITEMS_VALUES.ENTRIES],
		INDEX: 2
	}
};

const BONUS_MESSAGE = `<strong>Bonus: </strong> Manage ads.txt for all your partners with AdPushup&#8217;s 
<a
	className="u-text-underline"
	href="http://manageadstxt.com/?utm_source=adpushup&utm_medium=ads.txt_management"
	target="_blank"
>
	ads.txt management solution
</a>
.`;

const NOTE_MESSAGE = `<strong>Note: </strong> Ads.txt is mandatory. It needs to be updated incase you
already have one. Else please follow the intsructions provided here :
<a
	className="u-text-underline"
	href="https://support.google.com/admanager/answer/7441288?hl=en"
	target="_blank"
>
	https://support.google.com/admanager/answer/7441288?hl=en
</a>.
AdPushup&#8217;s ads.txt should be appended alongside your existing partners.`;

export {
	ADSTXT_NAV_ITEMS,
	ADSTXT_NAV_ITEMS_INDEXES,
	ADSTXT_NAV_ITEMS_VALUES,
	BONUS_MESSAGE,
	NOTE_MESSAGE
};
