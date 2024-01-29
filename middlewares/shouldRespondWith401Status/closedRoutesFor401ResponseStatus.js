const closedRoutesFor401ResponseStatus = [
	{
		routePrefix: '/cache',
		methods: ['DELETE']
	},
	{
		routePrefix: '/sync',
		methods: ['GET']
	}
];

module.exports = closedRoutesFor401ResponseStatus;
