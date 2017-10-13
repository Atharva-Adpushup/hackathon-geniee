import config from './config';
import moment from 'moment';

const apiQueryGenerator = params => {
	return JSON.stringify({
		select: config.SELECT,
		where: {
			siteid: 28822, // config.SITE_ID
			// pagegroup: 'MIC',
			// variation: '2e68228f-84da-415e-bfcf-bfcf67c87570',
			// device_type: this.props.activeChannel.platform,
			from: moment(params.startDate).format('YYYY-MM-DD'),
			to: moment(params.endDate).format('YYYY-MM-DD')
		},
		groupBy: ['pagegroup']
	});
};

export { apiQueryGenerator };
