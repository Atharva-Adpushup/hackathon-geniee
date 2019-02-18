import { connect } from 'react-redux';
import { createAd } from '../../../actions/apps/innovativeAds/adActions';
import { resetCurrentAd } from '../../../actions/apps/innovativeAds/globalActions';
import AdCodeGenerator from '../components/Home/AdCodeGenerator';

const mapStateToProps = (state, ownProps) => ({
	currentAd: state.global.currentAd,
	codeGenerated: !!state.global.currentAd,
	adId: state.global.currentAd,
	meta: state.global.meta,
	...ownProps
});

const mapDispatchToProps = dispatch => ({
	createAd: payload => dispatch(createAd(payload)),
	resetCurrentAd: () => dispatch(resetCurrentAd())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AdCodeGenerator);
