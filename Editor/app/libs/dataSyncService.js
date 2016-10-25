import $ from 'jquery';
import { arrayOf, normalize } from 'normalizr';
import { channelSchema } from 'schemas/site';

const save = (url, data) => ($.ajax({ type: 'POST', url, data, dataType: 'json' })),

	isApInstalled = (url, siteId) => $.getJSON(`/proxy/detectAp?url=${encodeURI(url)}&site=${siteId}`),

	changeSiteMode = (siteId, mode) => (
		save('/data/changeMode', { siteId, mode })
			.then((response) => (!!response.success))
	),

	loadInitialData = (siteId) => {
		const deferred = $.Deferred(),
			testNormalizr = () => {
				const dummyData = [{"id":"test2","channelName":"TEST2","siteDomain":"http://www.articlemyriad.com","platform":"DESKTOP","pageGroup":"POST","sampleUrl":"http://www.articlemyriad.com/character-divine-influence-iliad-aeneid-role-gods-fate/","variations":[],"isOpen":false,"isLoading":true,"contentSelector":".post-content","contentSelectorMissing":false,"activeVariation":null},{"id":"test","channelName":"TEST","siteDomain":"http://www.articlemyriad.com","platform":"DESKTOP","pageGroup":"POST","sampleUrl":"http://www.articlemyriad.com/character-divine-influence-iliad-aeneid-role-gods-fate/","variations":[{"id":"c6b9150f-5d91-4093-ac85-a219394a8a1d","name":"Var-1","createTs":1477321144,"customJs":{"beforeAp":null,"afterAp":null},"sections":[{"id":"521bd708-2e09-44fe-9978-cdd0de9bba56","xpath":".breadcrumb","operation":"Append","name":"Section-521bd708-2e09-44fe-9978-cdd0de9bba56","allXpaths":[],"ads":[{"id":"8b8f283f-fa60-4888-afb4-0e538d209622","css":{"margin-left":"auto","margin-right":"auto","margin-top":"0px","margin-bottom":"0px","clear":"both"},"height":280,"width":336}]},{"id":"07c51fad-50bb-4dd0-a24d-2eee61e24c15","xpath":"#searchform > div:eq(0)","operation":"Append","name":"Section-07c51fad-50bb-4dd0-a24d-2eee61e24c15","allXpaths":[],"ads":[]},{"id":"793810f6-3a6c-4dbf-aa5d-1aff6211990f","xpath":".search_section_bottom","operation":"Insert After","name":"Section-793810f6-3a6c-4dbf-aa5d-1aff6211990f","allXpaths":[],"ads":[{"id":"05030f67-401c-4b60-90c7-182a9652d1e8","css":{"margin-left":"auto","margin-right":"auto","margin-top":"0px","margin-bottom":"0px","clear":"both"},"height":250,"width":250}]},{"id":"82416f37-6fc3-4f1b-89ea-d3b8eb3c5344","xpath":".header","operation":"Insert After","name":"Section-82416f37-6fc3-4f1b-89ea-d3b8eb3c5344","allXpaths":[],"ads":[{"id":"c4af875a-ff48-459e-a4d0-9c5fcbedb18f","css":{"margin-left":"auto","margin-right":"auto","margin-top":"0px","margin-bottom":"0px","clear":"both"},"height":250,"width":300}]}]},{"id":"7c5829c8-f20a-4251-b97c-cf8db174a50f","name":"Var-2","createTs":1477321233,"customJs":{"beforeAp":null,"afterAp":null},"sections":[{"id":"d352212d-9c50-42c6-9c73-15cf74a42beb","xpath":"[id^=post_]:eq(0)","operation":"Insert Before","name":"Section-d352212d-9c50-42c6-9c73-15cf74a42beb","allXpaths":[],"ads":[{"id":"d731bb67-e15a-4cbf-83da-d9debf213cbf","css":{"margin-left":"auto","margin-right":"auto","margin-top":"0px","margin-bottom":"0px","clear":"both"},"height":200,"width":200}]}]},{"id":"92d8e601-4310-4fbc-b184-602dc0160ff8","name":"Variation 1","createTs":1477321279,"customJs":{"beforeAp":null,"afterAp":null},"sections":[]},{"id":"232cdf0a-4c32-475e-b763-f6de8af1940c","name":"Var-3","createTs":1477321323,"customJs":{"beforeAp":null,"afterAp":null},"sections":[]}],"isOpen":true,"isLoading":false,"contentSelector":".post-content","contentSelectorMissing":false,"activeVariation":"232cdf0a-4c32-475e-b763-f6de8af1940c"}],
					testData = (localStorage.getItem('siteData')) ? JSON.parse(localStorage.getItem('siteData')) : dummyData,
					result = normalize(testData, arrayOf(channelSchema)),
					computedResult = $.extend(true, {}, result.entities);
				let activeChannel;
				
				computedResult.channelData = {
					activeChannel: null,
					byIds: $.extend(true, {}, result.entities.channelData)
				};

				Object.keys(computedResult.channelData.byIds).forEach((channelKey) => {
					activeChannel = (computedResult.channelData.byIds[channelKey].activeVariation) ? channelKey : null;
				});

				computedResult.channelData.activeChannel = activeChannel;
				return computedResult;
			},
			json = testNormalizr();

		setTimeout(() => {
			deferred.resolve(json);
		}, 1000);

		return deferred.promise();
	},

	masterSave = (data) => {
		console.log('Got masterSaved data: ', data);
		localStorage.setItem('siteData', JSON.stringify(data));
		return Promise.resolve();

		/****TODO: Uncomment below temporary commented out code*****/
		/***save() api will be eventually used :)*****/
		// return save('/data/saveData', {
		// 	data: JSON.stringify(data)
		// });
	};

export { masterSave, changeSiteMode, isApInstalled, loadInitialData };
