import { domanize } from '../../../helpers/commonFunctions';

export default function(bidderConfig, siteId, domain) {
	const customParams = {};
	switch (bidderConfig.key) {
		case 'criteo': {
			customParams.publisherSubId = `AP/${siteId}_${domanize(domain)}`;

			return customParams;
		}
		case 'onetag': {
			customParams.ext = { placement_name: `AP/${siteId}_${domanize(domain)}` };

			return customParams;
		}
		default:
			return customParams;
	}
}
