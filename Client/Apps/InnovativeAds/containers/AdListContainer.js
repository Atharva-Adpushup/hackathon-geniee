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

const mapStateToProps = (state, ownProps) => {
	const { innovativeAds } = state.apps;
	const { user } = state.global;
	return {
		loading: !innovativeAds.ads.fetched,
		ads: innovativeAds.ads.content,
		meta: innovativeAds.global.meta,
		channels: innovativeAds.global.channels,
		user: user.data,
		...ownProps
	};
};
const mapDispatchToProps = dispatch => ({
	fetchAds: payload => dispatch(fetchAds(payload)),
	updateAd: (adId, payload) => dispatch(updateAd(adId, payload)),
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
