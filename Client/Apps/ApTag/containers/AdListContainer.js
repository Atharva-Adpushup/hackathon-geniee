import { connect } from 'react-redux';
import { fetchAds, updateAd, modifyAdOnServer } from '../../../actions/apps/apTag/adActions';
import { masterSave } from '../../../actions/apps/apTag/globalActions';
import AdList from '../components/Home/AdList/index';

const mapStateToProps = (state, ownProps) => {
	const { apTag } = state.apps;
	const { user, networkConfig } = state.global;
	return {
		loading: !apTag.ads.fetched,
		ads: apTag.ads.content,
		user: user.data,
		networkConfig: networkConfig.data,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	fetchAds: payload => dispatch(fetchAds(payload)),
	updateAd: (adId, payload) => dispatch(updateAd(adId, payload)),
	modifyAdOnServer: (siteId, adId, payload) => dispatch(modifyAdOnServer(siteId, adId, payload)),
	masterSave: siteId => dispatch(masterSave(siteId))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AdList);
