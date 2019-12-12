import { connect } from 'react-redux';
import { createAd } from '../../../actions/apps/innovativeAds/adActions';
import { resetCurrentAd } from '../../../actions/apps/innovativeAds/globalActions';
import AdCodeGenerator from '../components/Home/AdCodeGenerator';
import { getAdsAndGlobal } from '../lib/helpers';

const mapStateToProps = (state, ownProps) => {
	const { siteId, global } = getAdsAndGlobal(state, ownProps);

	return {
		currentAd: global.currentAd,
		codeGenerated: !!global.currentAd,
		adId: global.currentAd,
		meta: global.meta,
		channels: global.channels,
		siteId,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	createAd: payload => dispatch(createAd(payload)),
	resetCurrentAd: siteId => dispatch(resetCurrentAd(siteId))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AdCodeGenerator);
