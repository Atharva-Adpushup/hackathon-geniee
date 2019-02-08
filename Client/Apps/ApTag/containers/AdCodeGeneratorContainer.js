import { connect } from 'react-redux';
import { createAd } from '../../../actions/apps/apTag/adActions';
import { resetCurrentAd } from '../../../actions/apps/apTag/globalActions';
import AdCodeGenerator from '../components/Home/AdCodeGenerator';

const mapStateToProps = (state, ownProps) => ({
	currentAd: state.global.currentAd,
	codeGenerated: !!state.global.currentAd,
	adId: state.global.currentAd,
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
