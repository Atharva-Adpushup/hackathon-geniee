// Interactive ads renderer

import { h, render } from 'preact';
import commonConsts from '../commonConsts';
import Sticky from './components/Sticky';

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
				node = createParentNode(interactiveAd);

			switch (type) {
				case commonConsts.FORMATS.STICKY.NAME:
					render(<Sticky {...interactiveAd} />, node[0]);
					break;
			}
		}
	};

export default renderer;
