import { connect } from 'react-redux';
import { createAd } from '../../../actions/apps/innovativeAds/adActions';
import { resetCurrentAd } from '../../../actions/apps/innovativeAds/globalActions';
import AdCodeGenerator from '../components/Home/AdCodeGenerator';

const mapStateToProps = (state, ownProps) => {
	const { innovativeAds } = state.apps;
	return {
		currentAd: innovativeAds.global.currentAd,
		codeGenerated: !!innovativeAds.global.currentAd,
		adId: innovativeAds.global.currentAd,
		meta: innovativeAds.global.meta,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	createAd: payload => dispatch(createAd(payload)),
	resetCurrentAd: () => dispatch(resetCurrentAd())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AdCodeGenerator);
