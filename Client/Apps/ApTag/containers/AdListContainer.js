import { connect } from 'react-redux';
import {
	fetchAds,
	updateAd,
	modifyAdOnServer,
	updateAllAds
} from '../../../actions/apps/apTag/adActions';
import { masterSave } from '../../../actions/apps/apTag/globalActions';
import AdList from '../components/Home/AdList/index';
import { getAdsAndGlobal } from '../lib/helpers';

const mapStateToProps = (state, ownProps) => {
	const { siteId, ads, networkCode, siteDomain } = getAdsAndGlobal(state, ownProps);
	const { user, networkConfig } = state.global;

	return {
		loading: !ads.fetched,
		ads: ads.content,
		user: user.data,
		networkConfig: networkConfig.data,
		siteId,
		siteDomain,
		networkCode,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	fetchAds: payload => dispatch(fetchAds(payload)),
	updateAd: (adId, siteId, payload) => dispatch(updateAd(adId, siteId, payload)),
	modifyAdOnServer: (siteId, adId, payload) => dispatch(modifyAdOnServer(siteId, adId, payload)),
	masterSave: siteId => dispatch(masterSave(siteId)),
	updateAllAds: (siteId, ads) => dispatch(updateAllAds(siteId, ads))
});

export default connect(mapStateToProps, mapDispatchToProps)(AdList);
