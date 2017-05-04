const MESSAGES = {
	SITE_INVALID: 'MailTrigger: Site is non Geniee. Mail sending failed.',
	MAIL_SUCCESS: 'MailTrigger: Mail sent successfully'
},
SITE = {
	MODE: {
		PUBLISH: 1,
		DRAFT: 2
	}
},
DATE = {
	FORMAT: {
		'y-m-d': 'YYYY-MM-DD'
	}
};

module.exports = { MESSAGES, SITE, DATE };
