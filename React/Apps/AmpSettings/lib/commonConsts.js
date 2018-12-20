const commonConsts = {
	pagegroupSelectors: {
		breadcrumb: { alias: 'Breadcrumb', value: 'breadcrumb', inputType: 'text', dataType: 'string' },
		headlineTitle: { alias: 'Headline Title', value: 'headlineTitle', inputType: 'text', dataType: 'string' },
		headlineSubtitle: {
			alias: 'Headline Subtitle',
			value: 'headlineSubtitle',
			inputType: 'text',
			dataType: 'string'
		},
		timeStampPublished: {
			alias: 'TimeStamp Published',
			value: 'timeStampPublished',
			inputType: 'text',
			dataType: 'string'
		},
		timeStampModified: {
			alias: 'TimeStamp Modified',
			value: 'timeStampModified',
			inputType: 'text',
			dataType: 'string'
		},
		authorInfo: { alias: 'Author Info', value: 'authorInfo', inputType: 'text', dataType: 'string' },
		articleContent: { alias: 'Article Content', value: 'articleContent', inputType: 'textarea', dataType: 'array' },
		afterContent: { alias: 'After Content', value: 'afterContent', inputType: 'text', dataType: 'string' },
		logo: { alias: 'Logo', value: 'logo', inputType: 'text', dataType: 'string' }
	},
	siteSelectors: {
		footer: { alias: 'Footer', value: 'footer', inputType: 'text', dataType: 'string' }
	},
	socialApps: [
		{ label: 'facebook', value: 'facebook' },
		{ label: 'twitter', value: 'twitter' },
		{ label: 'linkedin', value: 'linkedin' },
		{ label: 'gmail', value: 'gmail' },
		{ label: 'whatsapp', value: 'whatsapp' },
		{ label: 'email', value: 'email' },
		{ label: 'pinterest', value: 'pinterest' },
		{ label: 'tumblr', value: 'tumblr' },
		{ label: 'line', value: 'line' },
		{ label: 'sms', value: 'sms' },
		{ label: 'gplus', value: 'gplus' }
	],
	ads: {
		type: {
			adsense: {
				slotId: { alias: 'slotId', value: 'slotId' },
				pubId: { alias: 'pubId', value: 'pubId' }
			},
			adpTags: {
				slotId: { alias: 'slotId', value: 'slotId' }
			}
		},
		sampleAds: {
			adsense: `<amp-ad width=dWidth height=dHeight
						type="adsense"
						data-ad-client="pubId"
						data-ad-slot="slotId">
					</amp-ad>`,
			adpTags: `<amp-ad width=dWidth height=dHeight
					type="doubleclick"
					data-slot="slotId">
				</amp-ad>`
		},
		operations: ['APPEND', 'PREPEND', 'INSERTAFTER', 'INSERTBEFORE']
	},
	analytics: {
		google_analytics: {
			ua: { alias: 'UA Id', name: 'ua' }
		}
	}
	// analytics: [
	// 	{
	// 		value: 'google_analytics',
	// 		label: 'Google Analytics',
	// 		fields: [{ alias: 'UA Id1', name: 'ua' }]
	// 	},
	// 	{
	// 		value: 'google_analytics1',
	// 		label: 'Google Analytics',
	// 		fields: [{ alias: 'UA Id2', name: 'ua' }]
	// 	},
	// 	{
	// 		value: 'google_analytics2',
	// 		label: 'Google Analytics',
	// 		fields: [{ alias: 'UA Id3', name: 'ua' }]
	// 	}
	// ]
};
export default commonConsts;
