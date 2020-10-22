import { connect } from 'react-redux';
import { createAd } from '../../../actions/apps/apTag/adActions';
import { showNotification } from '../../../actions/uiActions';
import { resetCurrentAd } from '../../../actions/apps/apTag/globalActions';
import AdCodeGenerator from '../components/Home/AdCodeGenerator';
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

const mapDispatchToProps = dispatch => ({
	createAd: payload => dispatch(createAd(payload)),
	resetCurrentAd: siteId => dispatch(resetCurrentAd(siteId)),
	showNotification: data => dispatch(showNotification(data))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AdCodeGenerator);
