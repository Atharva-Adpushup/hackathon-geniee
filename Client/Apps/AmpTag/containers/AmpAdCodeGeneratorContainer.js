import { connect } from 'react-redux';
import { createAmpAd } from '../../../actions/apps/amp/ampAdActions';
import { resetCurrentAdAmp } from '../../../actions/apps/amp/globalActions';
import AmpAdCodeGenerator from '../components/Home/AmpAdCodeGenerator';
import { showNotification } from '../../../actions/uiActions';

import { getAdsAndGlobalForAmpNew } from '../lib/helpers';

const mapStateToProps = (state, ownProps) => {
	const { global, siteId, currentAdDoc = {}, networkCode } = getAdsAndGlobalForAmpNew(
		state,
		ownProps
	);
	const { ad = {} } = currentAdDoc;
	return {
		currentAd: global.currentAd,
		codeGenerated: !!global.currentAd,
		adId: global.currentAd,
		maxHeight: global.maxHeight,
		type: ad ? ad.type : '',
		networkCode,
		siteId,
		...ownProps
	};
};

export default connect(mapStateToProps, { showNotification, createAmpAd, resetCurrentAdAmp })(
	AmpAdCodeGenerator
);
