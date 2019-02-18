import { connect } from 'react-redux';
import { createAd, fetchAds, updateAd } from '../../../actions/apps/innovativeAds/adActions';
import { masterSave } from '../../../actions/apps/innovativeAds/globalActions';
import Home from '../components/Home/index';

const mapStateToProps = (state, ownProps) => ({
	createAdError: state.ui.errors.adCreation.value,
	fetchAdsError: state.ui.errors.fetchAds.value,
	currentAd: state.global.currentAd,
	ads: state.ads,
	...ownProps
});

const mapDispatchToProps = dispatch => ({
	createAd: payload => dispatch(createAd(payload)),
	fetchAds: payload => dispatch(fetchAds(payload)),
	updateAd: (adId, payload) => dispatch(updateAd(adId, payload)),
	masterSave: siteId => dispatch(masterSave(siteId))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Home);
