import { connect } from 'react-redux';
import { createAd } from '../../../actions/apps/amp/adActions';
import { resetCurrentAd } from '../../../actions/apps/amp/globalActions';
import AdCodeGenerator from '../components/Home/AdCodeGenerator';
import { showNotification } from '../../../actions/uiActions';

import { getAdsAndGlobal } from '../lib/helpers';

const mapStateToProps = (state, ownProps) => {
	const { global, siteId } = getAdsAndGlobal(state, ownProps);
	return {
		currentAd: global.currentAd,
		codeGenerated: !!global.currentAd,
		adId: global.currentAd,
		maxHeight: global.maxHeight,
		siteId,
		...ownProps
	};
};

// const mapDispatchToProps = dispatch => ({
// createAd: payload => dispatch(createAd(payload)),
// 	resetCurrentAd: siteId => dispatch(resetCurrentAd(siteId))
// });

export default connect(
	mapStateToProps,
	{ showNotification, createAd, resetCurrentAd }
)(AdCodeGenerator);
