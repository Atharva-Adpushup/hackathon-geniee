// Interactive ads renderer

import commonConsts from '../commonConsts';
import Sticky from './components/Sticky';
import Video from './components/Video';
import { generateAdCode } from '../../../genieeAdSyncService/genieeAp/src/adCodeGenerator';

const $ = window.adpushup.$ || window.$,
	createParentNode = (appendTo, interactiveAd) => {
		const node = $('<div/>'),
			{ id } = interactiveAd;

		node.attr({ class: commonConsts.DEFAULT_CLASSNAME, id });
		$(appendTo).append(node);

		return node;
	},
	renderFormat = (format, interactiveAd, adCode) => {
		let ad = null;

		switch(format) {
			case commonConsts.FORMATS.STICKY.NAME:
				const sticky = Sticky(interactiveAd),
					node = createParentNode('body', interactiveAd);

				ad = sticky.append(adCode);
			break;
			case commonConsts.FORMATS.VIDEO.NAME:
				const video = Video(interactiveAd),
					{ xpath } = interactiveAd.formatData,
					node = createParentNode(xpath, interactiveAd);

				ad = video.append(adCode);				
				break;
		}

		return node.append(ad);
	},
	renderer = (interactiveAd, eventData) => {
		if (interactiveAd && interactiveAd.formatData) {
			const type = interactiveAd.formatData.type,
				adCode = generateAdCode(interactiveAd);

			switch (type) {
				case commonConsts.FORMATS.STICKY.NAME:
					return renderFormat(commonConsts.FORMATS.STICKY.NAME, interactiveAd, adCode);
				case commonConsts.FORMATS.VIDEO.NAME:
					return renderFormat(commonConsts.FORMATS.VIDEO.NAME, interactiveAd, adCode)
			}
		}
	};

export default renderer;
