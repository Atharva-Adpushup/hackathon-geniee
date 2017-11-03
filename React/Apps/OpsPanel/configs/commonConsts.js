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
			sortable: true,
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
	];

export { siteMappingActions, labels, headers };
