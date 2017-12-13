window.addEventListener('DOMContentLoaded', function(data) {
	console.log('DOM loaded');
});

window.$ = require('jquery');

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
			console.log('requiring script');
			require('./index')(config);
		},
		'adpPageAds'
	);
}
