import { connect } from 'react-redux';
import { fetchAds, updateAd, modifyAdOnServer } from '../../../actions/apps/apTag/adActions';
import { masterSave } from '../../../actions/apps/apTag/globalActions';
import AdList from '../components/Home/AdList/index';

const mapStateToProps = (state, ownProps) => {
	const { apTag } = state.apps;
	return {
		loading: !apTag.ads.fetched,
		ads: apTag.ads.content,
		networkConfig: apTag.global.networkConfig,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	fetchAds: payload => dispatch(fetchAds(payload)),
	updateAd: (adId, payload) => dispatch(updateAd(adId, payload)),
	modifyAdOnServer: (adId, payload) => dispatch(modifyAdOnServer(adId, payload)),
	masterSave: siteId => dispatch(masterSave(siteId))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AdList);
