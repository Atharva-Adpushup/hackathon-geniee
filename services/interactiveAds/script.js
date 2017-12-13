const config = [
	{
		event: 'DOMContentLoaded',
		type: 'sticky',
		placement: 'bottom',
		size: [300, 250]
	}
];

if (config) {
	require.ensure(
		['./index.js'],
		require => {
			require('./index')(config);
		},
		'adpPageAds'
	);
}
