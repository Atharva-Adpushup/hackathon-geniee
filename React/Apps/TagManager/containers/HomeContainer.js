import { connect } from 'react-redux';
import { createAd, fetchAds } from '../actions/adActions';
import Home from '../components/Home/index.jsx';

const mapStateToProps = (state, ownProps) => ({
		createAdError: state.ui.errors.adCreation.value,
		fetchAdsError: state.ui.errors.fetchAds.value,
		currentAd: state.global.currentAd,
		ads: state.ads,
		...ownProps
	}),
	mapDispatchToProps = dispatch => ({
		createAd: payload => dispatch(createAd(payload)),
		fetchAds: payload => dispatch(fetchAds(payload))
	});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
