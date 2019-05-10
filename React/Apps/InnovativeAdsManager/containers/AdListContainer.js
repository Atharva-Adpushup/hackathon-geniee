import { connect } from 'react-redux';
import { fetchAds, updateAd, modifyAdOnServer, archiveAd, updateTraffic } from '../actions/adActions';
import { masterSave } from '../actions/globalActions';
import AdList from '../components/Home/AdList/index';

const mapStateToProps = (state, ownProps) => ({
	loading: !state.ads.fetched,
	ads: state.ads.content,
	meta: state.global.meta,
	...ownProps
});
const mapDispatchToProps = dispatch => ({
	fetchAds: payload => dispatch(fetchAds(payload)),
	updateAd: (adId, payload) => dispatch(updateAd(adId, payload)),
	modifyAdOnServer: (adId, payload) => dispatch(modifyAdOnServer(adId, payload)),
	archiveAd: (adId, payload, isSuperUser) => dispatch(archiveAd(adId, payload, isSuperUser)),
	updateTraffic: (adId, payload, isSuperUser) => dispatch(updateTraffic(adId, payload, isSuperUser)),
	masterSave: siteId => dispatch(masterSave(siteId))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AdList);
