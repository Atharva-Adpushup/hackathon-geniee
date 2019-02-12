import { connect } from 'react-redux';
import { createAd } from '../../../actions/apps/apTag/adActions';
import { resetCurrentAd } from '../../../actions/apps/apTag/globalActions';
import AdCodeGenerator from '../components/Home/AdCodeGenerator';

const mapStateToProps = (state, ownProps) => {
	const { apTag } = state.apps;
	return {
		currentAd: apTag.global.currentAd,
		codeGenerated: !!apTag.global.currentAd,
		adId: apTag.global.currentAd,
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
