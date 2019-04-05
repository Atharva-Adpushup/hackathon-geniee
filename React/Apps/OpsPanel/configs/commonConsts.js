const siteMappingActions = {
		FETCH_SITES: 'FETCH_SITES',
		SET_SITES_DATA: 'SET_SITES_DATA'
	},
	liveSitesMappingActions = {
		FETCH_LIVE_SITES: 'FETCH_LIVE_SITES',
		SET_LIVE_SITES_DATA: 'SET_LIVE_SITES_DATA'
	},
	DEFAULT_HB_CONFIG = {
		'300x250': [],
		'250x250': [],
		'200x200': [],
		'336x280': [],
		'728x90': [],
		'468x60': [],
		'300x600': [],
		'160x600': [],
		'120x600': [],
		'320x50': [],
		'320x100': [],
		'900x90': [],
		'970x250': [],
		'300x1050': [],
		responsivexresponsive: []
	},
	globalMetricChartsActions = {
		FETCH_NETWORK_WISE_DATA: 'FETCH_NETWORK_WISE_DATA',
		SET_NETWORK_WISE_DATA: 'SET_NETWORK_WISE_DATA',
		FETCH_METRICS_DATA: 'FETCH_METRICS_DATA',
		SET_METRICS_DATA: 'SET_METRICS_DATA',
		FETCH_MODE_WISE_TRAFFIC_DATA: 'FETCH_MODE_WISE_TRAFFIC_DATA',
		SET_MODE_WISE_TRAFFIC_DATA: 'SET_MODE_WISE_TRAFFIC_DATA',
		FETCH_TOP_10_COUNTRIES_DATA: 'FETCH_TOP_10_COUNTRIES_DATA',
		SET_TOP_10_COUNTRIES_DATA: 'SET_TOP_10_COUNTRIES_DATA',
		FETCH_TOP_10_SITES_DATA: 'FETCH_TOP_10_SITES_DATA',
		SET_TOP_10_SITES_DATA: 'SET_TOP_10_SITES_DATA',
		FETCH_LOST_AND_FOUND_LIVE_SITES_DATA: 'FETCH_LOST_AND_FOUND_LIVE_SITES_DATA',
		SET_LOST_AND_FOUND_LIVE_SITES_DATA: 'SET_LOST_AND_FOUND_LIVE_SITES_DATA'
	},
	siteMapping = {
		labels: {
			siteId: 'Site Id',
			siteDomain: 'Site Domain',
			ownerEmail: 'Owner Email',
			channels: 'Channels',
			mode: 'Mode',
			step: 'Status',
			customSizes: 'Custom Sizes',
			dateCreated: 'Date Created',
			pubId: 'Publisher Id',
			adsenseEmail: 'Adsense Email'
		},
		headers: [
			{
				title: 'Site Id',
				prop: 'Site Id',
				sortable: true,
				filterable: true
			},
			{
				title: 'Site Domain',
				prop: 'Site Domain',
				sortable: true,
				filterable: true
			},
			{
				title: 'Owner Email',
				prop: 'Owner Email',
				sortable: true,
				filterable: true
			},
			{
				title: 'Mode',
				prop: 'Mode',
				filterable: true
			},
			{
				title: 'Date Created',
				prop: 'Date Created',
				sortable: true,
				filterable: true
			},
			{
				title: 'Channels',
				prop: 'Channels',
				sortable: true,
				filterable: true
			},
			{
				title: 'Status',
				prop: 'Status',
				sortable: true,
				filterable: true
			},
			{
				title: 'Publisher Id',
				prop: 'Publisher Id',
				sortable: true,
				filterable: true
			},
			{
				title: 'Adsense Email',
				prop: 'Adsense Email',
				sortable: true,
				filterable: true
			}
			// {
			// 	title: 'Custom Sizes',
			// 	prop: 'Custom Sizes',
			// 	sortable: true,
			// 	filterable: true
			// }
		],
		modes: [
			{
				name: 'Both',
				value: 0
			},
			{
				name: 'Live',
				value: 1
			},
			{
				name: 'Draft',
				value: 2
			}
		],
		statuses: [
			{
				name: 'All',
				value: 0
			},
			{
				name: 'Pre-onboarding',
				value: 1
			},
			{
				name: 'Onboarding',
				value: 2
			},
			{
				name: 'Onboarded',
				value: 3
			}
		]
	},
	liveSites = {
		labels: {
			siteId: 'Site Id',
			name: 'Site Domain',
			pageviews: 'Pageviews',
			adpushup_impressions: 'AdPushup Impressions',
			total_impressions: 'Total Impressions',
			total_gross_revenue: 'Total Gross Revenue',
			total_revenue: 'Total Revenue'
		},
		headers: [
			{
				title: 'Site Id',
				prop: 'Site Id',
				sortable: true,
				filterable: true
			},
			{
				title: 'Site Domain',
				prop: 'Site Domain',
				sortable: true,
				filterable: true
			},
			{
				title: 'Pageviews',
				prop: 'Pageviews',
				sortable: true,
				filterable: true
			},
			{
				title: 'AdPushup Impressions',
				prop: 'AdPushup Impressions',
				filterable: true
			},
			{
				title: 'Total Impressions',
				prop: 'Total Impressions',
				sortable: true,
				filterable: true
			},
			{
				title: 'Total Gross Revenue',
				prop: 'Total Gross Revenue',
				sortable: true,
				filterable: true
			},
			{
				title: 'Total Revenue',
				prop: 'Total Revenue',
				sortable: true,
				filterable: true
			}
		]
	},
	LINE_CHART_CONFIG = {
		colors: ['#d9d332', '#d97f3e', '#50a4e2', '#2e3b7c', '#bf4b9b', '#4eba6e', '#eb575c', '#ca29f3'],
		credits: {
			enabled: false
		},
		chart: {
			type: 'line'
		},
		title: {
			text: ''
		},
		xAxis: {
			categories: []
		},
		yAxis: {
			title: {
				text: ''
			}
		},
		plotOptions: {
			line: {
				dataLabels: {
					enabled: true
				},
				enableMouseTracking: true
			}
		},
		series: []
	},
	PIE_CHART_CONFIG = {
		colors: ['#d9d332', '#d97f3e', '#50a4e2', '#2e3b7c', '#bf4b9b', '#4eba6e', '#eb575c', '#ca29f3'],
		credits: {
			enabled: false
		},
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: 'pie'
		},
		title: {
			text: ''
		},
		tooltip: {
			pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					format: '<b>{point.name}</b>: {point.percentage:.1f} %',
					style: {
						color: '#555555'
					}
				}
			}
		},
		series: [
			{
				name: 'Metrics',
				colorByPoint: true,
				data: []
			}
		]
	},
	sizeConfigOptions = [
		{
			value: '300 250',
			label: '300x250'
		},
		{
			value: '250 250',
			label: '250x250'
		},
		{
			value: '200 200',
			label: '200x200'
		},
		{
			value: '336 280',
			label: '336x280'
		},
		{
			value: '728 90',
			label: '728x90'
		},
		{
			value: '468 60',
			label: '468x60'
		},
		{
			value: '300 600',
			label: '300x600'
		},
		{
			value: '160 600',
			label: '160x600'
		},
		{
			value: '120 600',
			label: '120x600'
		},
		{
			value: '320 50',
			label: '320x50'
		},
		{
			value: '320 100',
			label: '320x100'
		},
		{
			value: '900 90',
			label: '900x90'
		},
		{
			value: '970 250',
			label: '970x250'
		},
		{
			value: '300 1050',
			label: '300x1050'
		},
		{
			value: 'responsive responsive',
			label: 'responsivexresponsive'
		}
	],
	partnersList = [
		{
			value: 'districtm',
			label: 'districtm'
		},
		{
			value: 'oftmedia',
			label: 'oftmedia'
		},
		{
			value: 'pulsepoint',
			label: 'pulsepoint'
		},
		{
			value: 'c1x',
			label: 'c1x'
		},
		{
			value: 'medianet',
			label: 'medianet'
		},
		{
			value: 'districtmDMX',
			label: 'districtmDMX'
		},
		{
			value: 'openx',
			label: 'openx'
		},
		{
			value: 'conversant',
			label: 'conversant'
		},
		{
			value: '33across',
			label: '33across'
		},
		{
			value: 'ix',
			label: 'ix'
		}
	],
	devicesList = [
		'(min-width: 1200px)',
		'(min-width: 768px) and (max-width: 1199px)',
		'(min-width: 0px) and (max-width: 767px)'
	],
	biddersParams = {
		districtm: [
			{
				name: 'placementId',
				type: 'string'
			}
		],
		oftmedia: [
			{
				name: 'placementId',
				type: 'string'
			}
		],
		pulsepoint: [
			{
				name: 'cf',
				type: 'string'
			},
			{
				name: 'cp',
				type: 'integer'
			},
			{
				name: 'ct',
				type: 'integer'
			}
		],
		c1x: [
			{
				name: 'siteId',
				type: 'string'
			}
		],
		medianet: [
			{
				name: 'cid',
				type: 'string'
			}
		],
		districtmDMX: [
			{
				name: 'dmxid',
				type: 'integer'
			},
			{
				name: 'memberid',
				type: 'integer'
			}
		],
		openx: [
			{
				name: 'delDomain',
				type: 'string'
			},
			{
				name: 'unit',
				type: 'string'
			}
		],
		conversant: [
			{
				name: 'site_id',
				type: 'string'
			},
			{
				name: 'secure',
				type: 'integer'
			}
		],
		'33across': [
			{
				name: 'siteId',
				type: 'string'
			},
			{
				name: 'productId',
				type: 'string'
			}
		],
		ix: [
			{
				name: 'siteId',
				type: 'string'
			},
			{
				name: 'size',
				type: 'string'
			}
		]
	},
	countryCollection = [
		{ label: 'Afghanistan', value: 'af' },
		{ label: 'Albania', value: 'al' },
		{ label: 'Antarctica', value: 'aq' },
		{ label: 'Algeria', value: 'dz' },
		{ label: 'American Samoa', value: 'as' },
		{ label: 'Andorra', value: 'ad' },
		{ label: 'Angola', value: 'ao' },
		{ label: 'Antigua and Barbuda', value: 'ag' },
		{ label: 'Azerbaijan', value: 'az' },
		{ label: 'Argentina', value: 'ar' },
		{ label: 'Australia', value: 'au' },
		{ label: 'Austria', value: 'at' },
		{ label: 'Bahamas', value: 'bs' },
		{ label: 'Bahrain', value: 'bh' },
		{ label: 'Bangladesh', value: 'bd' },
		{ label: 'Armenia', value: 'am' },
		{ label: 'Barbados', value: 'bb' },
		{ label: 'Belgium', value: 'be' },
		{ label: 'Bermuda', value: 'bm' },
		{ label: 'Bhutan', value: 'bt' },
		{ label: 'Bolivia, Plurinational State of', value: 'bo' },
		{ label: 'Bosnia and Herzegovina', value: 'ba' },
		{ label: 'Botswana', value: 'bw' },
		{ label: 'Bouvet Island', value: 'bv' },
		{ label: 'Brazil', value: 'br' },
		{ label: 'Belize', value: 'bz' },
		{ label: 'British Indian Ocean Territory', value: 'io' },
		{ label: 'Solomon Islands', value: 'sb' },
		{ label: 'Virgin Islands, British', value: 'vg' },
		{ label: 'Brunei Darussalam', value: 'bn' },
		{ label: 'Bulgaria', value: 'bg' },
		{ label: 'Myanmar', value: 'mm' },
		{ label: 'Burundi', value: 'bi' },
		{ label: 'Belarus', value: 'by' },
		{ label: 'Cambodia', value: 'kh' },
		{ label: 'Cameroon', value: 'cm' },
		{ label: 'Canada', value: 'ca' },
		{ label: 'Cape Verde', value: 'cv' },
		{ label: 'Cayman Islands', value: 'ky' },
		{ label: 'Central African Republic', value: 'cf' },
		{ label: 'Sri Lanka', value: 'lk' },
		{ label: 'Chad', value: 'td' },
		{ label: 'Chile', value: 'cl' },
		{ label: 'China', value: 'cn' },
		{ label: 'Taiwan, Province of China', value: 'tw' },
		{ label: 'Christmas Island', value: 'cx' },
		{ label: 'Cocos (Keeling) Islands', value: 'cc' },
		{ label: 'Colombia', value: 'co' },
		{ label: 'Comoros', value: 'km' },
		{ label: 'Mayotte', value: 'yt' },
		{ label: 'Congo', value: 'cg' },
		{ label: 'Congo, the Democratic Republic of the', value: 'cd' },
		{ label: 'Cook Islands', value: 'ck' },
		{ label: 'Costa Rica', value: 'cr' },
		{ label: 'Croatia', value: 'hr' },
		{ label: 'Cuba', value: 'cu' },
		{ label: 'Cyprus', value: 'cy' },
		{ label: 'Czech Republic', value: 'cz' },
		{ label: 'Benin', value: 'bj' },
		{ label: 'Denmark', value: 'dk' },
		{ label: 'Dominica', value: 'dm' },
		{ label: 'Dominican Republic', value: 'do' },
		{ label: 'Ecuador', value: 'ec' },
		{ label: 'El Salvador', value: 'sv' },
		{ label: 'Equatorial Guinea', value: 'gq' },
		{ label: 'Ethiopia', value: 'et' },
		{ label: 'Eritrea', value: 'er' },
		{ label: 'Estonia', value: 'ee' },
		{ label: 'Faroe Islands', value: 'fo' },
		{ label: 'Falkland Islands (Malvinas)', value: 'fk' },
		{ label: 'South Georgia and the South Sandwich Islands', value: 'gs' },
		{ label: 'Fiji', value: 'fj' },
		{ label: 'Finland', value: 'fi' },
		{ label: 'Åland Islands', value: 'ax' },
		{ label: 'France', value: 'fr' },
		{ label: 'French Guiana', value: 'gf' },
		{ label: 'French Polynesia', value: 'pf' },
		{ label: 'French Southern Territories', value: 'tf' },
		{ label: 'Djibouti', value: 'dj' },
		{ label: 'Gabon', value: 'ga' },
		{ label: 'Georgia', value: 'ge' },
		{ label: 'Gambia', value: 'gm' },
		{ label: 'Palestinian Territory, Occupied', value: 'ps' },
		{ label: 'Germany', value: 'de' },
		{ label: 'Ghana', value: 'gh' },
		{ label: 'Gibraltar', value: 'gi' },
		{ label: 'Kiribati', value: 'ki' },
		{ label: 'Greece', value: 'gr' },
		{ label: 'Greenland', value: 'gl' },
		{ label: 'Grenada', value: 'gd' },
		{ label: 'Guadeloupe', value: 'gp' },
		{ label: 'Guam', value: 'gu' },
		{ label: 'Guatemala', value: 'gt' },
		{ label: 'Guinea', value: 'gn' },
		{ label: 'Guyana', value: 'gy' },
		{ label: 'Haiti', value: 'ht' },
		{ label: 'Heard Island and McDonald Islands', value: 'hm' },
		{ label: 'Holy See (Vatican City State)', value: 'va' },
		{ label: 'Honduras', value: 'hn' },
		{ label: 'Hong Kong', value: 'hk' },
		{ label: 'Hungary', value: 'hu' },
		{ label: 'Iceland', value: 'is' },
		{ label: 'India', value: 'in' },
		{ label: 'Indonesia', value: 'id' },
		{ label: 'Iran, Islamic Republic of', value: 'ir' },
		{ label: 'Iraq', value: 'iq' },
		{ label: 'Ireland', value: 'ie' },
		{ label: 'Israel', value: 'il' },
		{ label: 'Italy', value: 'it' },
		{ label: "Côte d'Ivoire", value: 'ci' },
		{ label: 'Jamaica', value: 'jm' },
		{ label: 'Japan', value: 'jp' },
		{ label: 'Kazakhstan', value: 'kz' },
		{ label: 'Jordan', value: 'jo' },
		{ label: 'Kenya', value: 'ke' },
		{ label: "Korea, Democratic People's Republic of", value: 'kp' },
		{ label: 'Korea, Republic of', value: 'kr' },
		{ label: 'Kuwait', value: 'kw' },
		{ label: 'Kyrgyzstan', value: 'kg' },
		{ label: "Lao People's Democratic Republic", value: 'la' },
		{ label: 'Lebanon', value: 'lb' },
		{ label: 'Lesotho', value: 'ls' },
		{ label: 'Latvia', value: 'lv' },
		{ label: 'Liberia', value: 'lr' },
		{ label: 'Libyan Arab Jamahiriya', value: 'ly' },
		{ label: 'Liechtenstein', value: 'li' },
		{ label: 'Lithuania', value: 'lt' },
		{ label: 'Luxembourg', value: 'lu' },
		{ label: 'Macao', value: 'mo' },
		{ label: 'Madagascar', value: 'mg' },
		{ label: 'Malawi', value: 'mw' },
		{ label: 'Malaysia', value: 'my' },
		{ label: 'Maldives', value: 'mv' },
		{ label: 'Mali', value: 'ml' },
		{ label: 'Malta', value: 'mt' },
		{ label: 'Martinique', value: 'mq' },
		{ label: 'Mauritania', value: 'mr' },
		{ label: 'Mauritius', value: 'mu' },
		{ label: 'Mexico', value: 'mx' },
		{ label: 'Monaco', value: 'mc' },
		{ label: 'Mongolia', value: 'mn' },
		{ label: 'Moldova, Republic of', value: 'md' },
		{ label: 'Montenegro', value: 'me' },
		{ label: 'Montserrat', value: 'ms' },
		{ label: 'Morocco', value: 'ma' },
		{ label: 'Mozambique', value: 'mz' },
		{ label: 'Oman', value: 'om' },
		{ label: 'Namibia', value: 'na' },
		{ label: 'Nauru', value: 'nr' },
		{ label: 'Nepal', value: 'np' },
		{ label: 'Netherlands', value: 'nl' },
		{ label: 'Netherlands Antilles', value: 'an' },
		{ label: 'Curaçao', value: 'cw' },
		{ label: 'Aruba', value: 'aw' },
		{ label: 'Sint Maarten (Dutch part)', value: 'sx' },
		{ label: 'Bonaire, Sint Eustatius and Saba', value: 'bq' },
		{ label: 'New Caledonia', value: 'nc' },
		{ label: 'Vanuatu', value: 'vu' },
		{ label: 'New Zealand', value: 'nz' },
		{ label: 'Nicaragua', value: 'ni' },
		{ label: 'Niger', value: 'ne' },
		{ label: 'Nigeria', value: 'ng' },
		{ label: 'Niue', value: 'nu' },
		{ label: 'Norfolk Island', value: 'nf' },
		{ label: 'Norway', value: 'no' },
		{ label: 'Northern Mariana Islands', value: 'mp' },
		{ label: 'United States Minor Outlying Islands', value: 'um' },
		{ label: 'Micronesia, Federated States of', value: 'fm' },
		{ label: 'Marshall Islands', value: 'mh' },
		{ label: 'Palau', value: 'pw' },
		{ label: 'Pakistan', value: 'pk' },
		{ label: 'Panama', value: 'pa' },
		{ label: 'Papua New Guinea', value: 'pg' },
		{ label: 'Paraguay', value: 'py' },
		{ label: 'Peru', value: 'pe' },
		{ label: 'Philippines', value: 'ph' },
		{ label: 'Pitcairn', value: 'pn' },
		{ label: 'Poland', value: 'pl' },
		{ label: 'Portugal', value: 'pt' },
		{ label: 'Guinea-Bissau', value: 'gw' },
		{ label: 'Timor-Leste', value: 'tl' },
		{ label: 'Puerto Rico', value: 'pr' },
		{ label: 'Qatar', value: 'qa' },
		{ label: 'Réunion', value: 're' },
		{ label: 'Romania', value: 'ro' },
		{ label: 'Russian Federation', value: 'ru' },
		{ label: 'Rwanda', value: 'rw' },
		{ label: 'Saint Barthélemy', value: 'bl' },
		{ label: 'Saint Helena, Ascension and Tristan da Cunha', value: 'sh' },
		{ label: 'Saint Kitts and Nevis', value: 'kn' },
		{ label: 'Anguilla', value: 'ai' },
		{ label: 'Saint Lucia', value: 'lc' },
		{ label: 'Saint Martin (French part)', value: 'mf' },
		{ label: 'Saint Pierre and Miquelon', value: 'pm' },
		{ label: 'Saint Vincent and the Grenadines', value: 'vc' },
		{ label: 'San Marino', value: 'sm' },
		{ label: 'Sao Tome and Principe', value: 'st' },
		{ label: 'Saudi Arabia', value: 'sa' },
		{ label: 'Senegal', value: 'sn' },
		{ label: 'Serbia', value: 'rs' },
		{ label: 'Seychelles', value: 'sc' },
		{ label: 'Sierra Leone', value: 'sl' },
		{ label: 'Singapore', value: 'sg' },
		{ label: 'Slovakia', value: 'sk' },
		{ label: 'Viet Nam', value: 'vn' },
		{ label: 'Slovenia', value: 'si' },
		{ label: 'Somalia', value: 'so' },
		{ label: 'South Africa', value: 'za' },
		{ label: 'Zimbabwe', value: 'zw' },
		{ label: 'Spain', value: 'es' },
		{ label: 'South Sudan', value: 'ss' },
		{ label: 'Western Sahara', value: 'eh' },
		{ label: 'Sudan', value: 'sd' },
		{ label: 'Suriname', value: 'sr' },
		{ label: 'Svalbard and Jan Mayen', value: 'sj' },
		{ label: 'Swaziland', value: 'sz' },
		{ label: 'Sweden', value: 'se' },
		{ label: 'Switzerland', value: 'ch' },
		{ label: 'Syrian Arab Republic', value: 'sy' },
		{ label: 'Tajikistan', value: 'tj' },
		{ label: 'Thailand', value: 'th' },
		{ label: 'Togo', value: 'tg' },
		{ label: 'Tokelau', value: 'tk' },
		{ label: 'Tonga', value: 'to' },
		{ label: 'Trinidad and Tobago', value: 'tt' },
		{ label: 'United Arab Emirates', value: 'ae' },
		{ label: 'Tunisia', value: 'tn' },
		{ label: 'Turkey', value: 'tr' },
		{ label: 'Turkmenistan', value: 'tm' },
		{ label: 'Turks and Caicos Islands', value: 'tc' },
		{ label: 'Tuvalu', value: 'tv' },
		{ label: 'Uganda', value: 'ug' },
		{ label: 'Ukraine', value: 'ua' },
		{ label: 'Macedonia, the former Yugoslav Republic of', value: 'mk' },
		{ label: 'Egypt', value: 'eg' },
		{ label: 'United Kingdom', value: 'gb' },
		{ label: 'Guernsey', value: 'gg' },
		{ label: 'Jersey', value: 'je' },
		{ label: 'Isle of Man', value: 'im' },
		{ label: 'Tanzania, United Republic of', value: 'tz' },
		{ label: 'United States', value: 'us' },
		{ label: 'Virgin Islands, U.S.', value: 'vi' },
		{ label: 'Burkina Faso', value: 'bf' },
		{ label: 'Uruguay', value: 'uy' },
		{ label: 'Uzbekistan', value: 'uz' },
		{ label: 'Venezuela, Bolivarian Republic of', value: 've' },
		{ label: 'Wallis and Futuna', value: 'wf' },
		{ label: 'Samoa', value: 'ws' },
		{ label: 'Yemen', value: 'ye' },
		{ label: 'Zambia', value: 'zm' }
	];

export {
	siteMappingActions,
	liveSitesMappingActions,
	globalMetricChartsActions,
	siteMapping,
	liveSites,
	devicesList,
	partnersList,
	countryCollection,
	biddersParams,
	sizeConfigOptions,
	LINE_CHART_CONFIG,
	PIE_CHART_CONFIG,
	DEFAULT_HB_CONFIG
};
