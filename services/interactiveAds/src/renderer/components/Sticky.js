// Sticky ad component

import { h, Component } from 'preact';
import AdCode from './AdCode';
import commonConsts from '../../commonConsts';
import { generateAdCode } from '../../../../genieeAdSyncService/genieeAp/src/adCodeGenerator';

class Sticky extends Component {
	constructor(props) {
		super(props);
		this.getPlacementCSS = this.getPlacementCSS.bind(this);
	}

	getPlacementCSS(formatData) {
		const placementCSS = commonConsts.FORMATS.STICKY.PLACEMENT_CSS;

		switch (formatData.placement) {
			case 'bottom':
				return placementCSS.BOTTOM;
		}
	}

	render() {
		const interactiveAd = this.props,
			formatData = interactiveAd.formatData,
			style = {
				width: interactiveAd.width,
				height: interactiveAd.height,
				...commonConsts.FORMATS.STICKY.BASE_STYLES,
				...this.getPlacementCSS(formatData)
			},
			adCode = generateAdCode(interactiveAd);

		return <AdCode style={style} adCode={adCode} />;
	}
}

export default Sticky;
