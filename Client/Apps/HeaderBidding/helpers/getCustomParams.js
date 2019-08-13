import { domanize } from '../../../helpers/commonFunctions';

export default function(bidderConfig, siteId, domain, size) {
	const customParams = {};
	switch (bidderConfig.key) {
		case 'ix': {
			customParams.size = size.split('x').map(val => parseInt(val, 10));

			return customParams;
		}
		case 'criteo': {
			customParams.publisherSubId = `AP/${siteId}_${domanize(domain)}`;

			return customParams;
		}
		default:
			return customParams;
	}
}
