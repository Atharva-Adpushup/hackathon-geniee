import $ from 'jquery';

const save = (url, data) => ($.ajax({ type: 'POST', url, data, dataType: 'json' })),

	isApInstalled = (url, siteId) => $.getJSON(`/proxy/detectAp?url=${encodeURI(url)}&site=${siteId}`),

	changeSiteMode = (siteId, mode) => (
		save('/data/changeMode', { siteId, mode })
			.then((response) => (!!response.success))
	),

	loadInitialData = (siteId) => {
		const deferred = $.Deferred(),
			json = {
				siteId,
				channelData: {
					activeChannel: 'test',
					byIds: {
						test2: {
							id: 'test2',
							channelName: 'TEST2',
							siteDomain: window.ADP_SITE_DOMAIN,
							platform: 'DESKTOP',
							pageGroup: 'POST',
							sampleUrl: 'http://www.articlemyriad.com/character-divine-influence-iliad-aeneid-role-gods-fate/',
							variations: [],
							isOpen: false,
							isLoading: true,
							contentSelector: '.post-content',
							contentSelectorMissing: false,
							activeVariation: null
						},
						test: {
							id: 'test',
							channelName: 'TEST',
							siteDomain: window.ADP_SITE_DOMAIN,
							platform: 'DESKTOP',
							pageGroup: 'POST',
							sampleUrl: 'http://www.articlemyriad.com/character-divine-influence-iliad-aeneid-role-gods-fate/',
							variations: [],
							isOpen: true,
							isLoading: true,
							contentSelector: '.post-content',
							contentSelectorMissing: false,
							activeVariation: null
						} }
				}
			};
		setTimeout(() => {
			deferred.resolve(json);
		}, 1000);

		return deferred.promise();
	},

	masterSave = (data) => {
		console.log('Got masterSaved data: ', data);
		return save('/data/saveData', {
			data: JSON.stringify(data)
		});
	};

export { masterSave, changeSiteMode, isApInstalled, loadInitialData };
