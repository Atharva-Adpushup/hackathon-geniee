const MESSAGES = {
		SITE_INVALID: 'MailTrigger: Site is non Geniee. Mail sending failed.',
		EMPTY_MAIL_DATA: 'MailTrigger: Email data is empty so it will not be send',
		MAIL_SUCCESS: 'MailTrigger: Mail sent successfully',
		VALID_DATA: 'MailTrigger: Report data is valid',
		INVALID_DATA: 'MailTrigger: Report data is invalid'
	},
	SITE = {
		MODE: {
			PUBLISH: {
				NAME: 'PUBLISH',
				TYPE: 1
			},
			DRAFT: {
				NAME: 'DRAFT',
				TYPE: 2
			}
		}
	},
	DATE = {
		FORMAT: {
			'y-m-d': 'YYYY-MM-DD'
		}
	},
	DATA = {
		KEYS: {
			MEDIA: 7,
			PAGEGROUPS: 2
		},
		PERCENTAGE: {
			PAGEVIEWS: 10,
			REVENUE: 10
		},
		MAIL: {
			CONTENT: {
				COMMON:
					'<h4>Reports data</h4>\n<ul><li>One day before: ___odbPageViews___ PageViews, ___odbRevenue___ Revenue</li><li>Two days before: ___tdbPageViews___ PageViews, ___tdbRevenue___ Revenue</li></ul>',
				DRAFT: {
					HEADER: 'Draft Mode | ___sitename___ (SiteId: ___siteId___)',
					CONTENT:
						'<h2>The site ___sitename___ is in draft mode!</h2>\n <p>This site had valid report data for last 2 days.</p>\n'
				},
				DATA_INCONSISTENT: {
					HEADER: 'Data Discrepancy | ___sitename___ (SiteId: ___siteId___)',
					CONTENT: '<h2>The site ___sitename___ has data discrepancy!</h2>\n'
				}
			},
			ID: 'anil.panghal@adpushup.com'
		}
	};

module.exports = { MESSAGES, SITE, DATE, DATA };
