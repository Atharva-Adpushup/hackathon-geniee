// Interactive ads renderer

import commonConsts from '../commonConsts';
import Sticky from './components/Sticky';
import { generateAdCode } from '../../../genieeAdSyncService/genieeAp/src/adCodeGenerator';

const $ = window.adpushup.$ || window.$,
	createParentNode = interactiveAd => {
		const node = $('<div/>'),
			{ id } = interactiveAd;

		node.attr({ class: commonConsts.DEFAULT_CLASSNAME, id });
		$('body').append(node);

		return node;
	},
	renderer = (interactiveAd, eventData) => {
		if (interactiveAd && interactiveAd.formatData) {
			const type = interactiveAd.formatData.type,
				node = createParentNode(interactiveAd),
				adCode = generateAdCode(interactiveAd);

			let ad = null;

			switch (type) {
				case commonConsts.FORMATS.STICKY.NAME:
					const sticky = Sticky(interactiveAd);
					ad = sticky.append(adCode);
					break;
			}

			return node.append(ad);
		}
	};

export default renderer;
