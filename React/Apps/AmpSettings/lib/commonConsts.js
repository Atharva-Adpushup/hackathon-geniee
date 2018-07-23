const commonConsts = {
	selectors: {
		breadcrumb: { alias: 'Breadcrumb', value: 'breadcrumb', inputType: 'text', dataType: 'string' },
		footer: { alias: 'Footer', value: 'footer', inputType: 'text', dataType: 'string' },
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
	socialApps: {
		facebook: { alias: 'Facebook', value: 'facebook' },
		twitter: { alias: 'Twitter', value: 'twitter' },
		linkedin: { alias: 'Linkedin', value: 'linkedin' },
		gmail: { alias: 'Gmail', value: 'gmail' },
		whatsapp: { alias: 'Whatsapp', value: 'whatsapp' },
		gplus: { alias: 'GPlus', value: 'gplus' }
	},
	ads: {
		type: {
			adsense: {
				slotId: { alias: 'slotId', value: 'slotId' },
				pubId: { alias: 'pubId', value: 'pubId' }
			},
			adx: {
				slotId: { alias: 'slotId', value: 'slotId' }
			}
		},
		sampleAds: {
			adsense: `<amp-ad width=dWidth height=dHeight
						type="adsense"
						data-ad-client="pubId"
						data-ad-slot="slotId">
					</amp-ad>`,
			adx: `<amp-ad width=dWidth height=dHeight
					type="doubleclick"
					data-slot="slotId">
				</amp-ad>`
		},
		operations: ['APPEND', 'PREPEND', 'INSERTAFTER', 'INSERTBEFORE']
	},
	analytics: {
		google_analytics: {
			ua: { alias: 'UA Id', value: 'ua' }
		}
	}
};
export default commonConsts;
