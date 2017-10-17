import config from './config';
import moment from 'moment';

const apiQueryGenerator = params => {
		let where = {
			siteid: 28822, // config.SITE_ID
			from: moment(params.startDate).format('YYYY-MM-DD'),
			to: moment(params.endDate).format('YYYY-MM-DD')
		};

		if (params.pageGroup) {
			where.pageGroup = params.pageGroup;
		}

		if (params.platform) {
			where.device_type = params.platform;
		}

		if (params.variationId) {
			where.variation = params.variationIds;
		}

		return JSON.stringify({
			select: config.SELECT,
			where
			//groupBy: ['pagegroup']
		});
	},
	chartConfigGenerator = data => {
		let config = {
			title: {
				text: ''
			},
			subtitle: {
				text: ''
			}
		};

		if (!data.error) {
			console.log(data);
		}
	};

export { apiQueryGenerator, chartConfigGenerator };
