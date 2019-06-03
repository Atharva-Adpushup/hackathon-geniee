import { connect } from 'react-redux';
import {
	fetchAds,
	updateAd,
	modifyAdOnServer,
	archiveAd,
	updateTraffic
} from '../../../actions/apps/innovativeAds/adActions';
import { masterSave } from '../../../actions/apps/innovativeAds/globalActions';
import AdList from '../components/Home/AdList/index';
import { getAdsAndGlobal } from '../lib/helpers';

const mapStateToProps = (state, ownProps) => {
	const { user } = state.global;
	const { siteId, ads, global } = getAdsAndGlobal(state, ownProps);

	return {
		loading: !ads.fetched,
		ads: ads.content,
		meta: global.meta,
		channels: global.channels,
		user: user.data,
		siteId,
		...ownProps
	};
};
const mapDispatchToProps = dispatch => ({
	fetchAds: payload => dispatch(fetchAds(payload)),
	updateAd: (adId, siteId, payload) => dispatch(updateAd(adId, siteId, payload)),
	modifyAdOnServer: (adId, siteId, payload) => dispatch(modifyAdOnServer(adId, siteId, payload)),
	archiveAd: (adId, siteId, payload, isSuperUser) =>
		dispatch(archiveAd(adId, siteId, payload, isSuperUser)),
	updateTraffic: (adId, siteId, payload, isSuperUser) =>
		dispatch(updateTraffic(adId, siteId, payload, isSuperUser)),
	masterSave: siteId => dispatch(masterSave(siteId))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AdList);
