import { connect } from 'react-redux';
import { createAd } from '../../../actions/apps/amp/adActions';
import { resetCurrentAd } from '../../../actions/apps/amp/globalActions';
import AdCodeGenerator from '../components/Home/AdCodeGenerator';
import { showNotification } from '../../../actions/uiActions';

import { getAdsAndGlobal } from '../lib/helpers';

const mapStateToProps = (state, ownProps) => {
	const { global, siteId, currentAdDoc = {} } = getAdsAndGlobal(state, ownProps);
	const { ad = {} } = currentAdDoc;
	return {
		currentAd: global.currentAd,
		codeGenerated: !!global.currentAd,
		adId: global.currentAd,
		maxHeight: global.maxHeight,
		type: ad ? ad.type : '',
		siteId,
		...ownProps
	};
};

export default connect(
	mapStateToProps,
	{ showNotification, createAd, resetCurrentAd }
)(AdCodeGenerator);
