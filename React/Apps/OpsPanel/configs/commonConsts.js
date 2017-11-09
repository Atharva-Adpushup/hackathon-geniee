const siteMappingActions = {
		FETCH_SITES: 'FETCH_SITES',
		SET_SITES_DATA: 'SET_SITES_DATA'
	},
	labels = {
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
	headers = [
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
	modes = [
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
	statuses = [
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
	];

export { siteMappingActions, labels, headers, modes, statuses };
