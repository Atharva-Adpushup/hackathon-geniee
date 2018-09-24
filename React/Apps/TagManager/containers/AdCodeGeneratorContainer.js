import { connect } from 'react-redux';
import { createAd } from '../actions/adActions';
import AdCodeGenerator from '../components/Home/AdCodeGenerator.jsx';

const mapStateToProps = (state, ownProps) => ({
		currentAd: state.global.currentAd,
		codeGenerated: state.global.currentAd ? true : false,
		adId: state.global.currentAd,
		...ownProps
	}),
	mapDispatchToProps = dispatch => ({
		createAd: payload => dispatch(createAd(payload))
	});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AdCodeGenerator);
