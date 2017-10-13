import config from './config';

const apiQueryGenerator = () => {
	return JSON.stringify({
		select: config.SELECT,
		where: {
			siteid: 28822 // config.SITE_ID
			//pagegroup: 'MIC',
			// variation: '2e68228f-84da-415e-bfcf-bfcf67c87570',
			// device_type: this.props.activeChannel.platform,
			// from: '2017-09-01',
			// to: '2017-09-06'
		},
		groupBy: ['pagegroup']
	});
};

export { apiQueryGenerator };
