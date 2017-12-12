const config = { format: 'stickyFooter' };

if (config) {
	require.ensure(
		['./index.js' /* webpackChunkName:"subload" */] /* webpackChunkName:"subload" */,
		function(require) {
			require('./index')(config);
		},
		'adpPageAds'
	);
}
