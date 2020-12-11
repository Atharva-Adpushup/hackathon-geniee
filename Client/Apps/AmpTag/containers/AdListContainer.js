import { connect } from 'react-redux';
import { fetchAds, updateAd, modifyAdOnServer } from '../../../actions/apps/amp/adActions';
import { masterSave } from '../../../actions/apps/amp/globalActions';
import AdList from '../components/Home/AdList/index';
import { getAdsAndGlobal } from '../lib/helpers';

const mapStateToProps = (state, ownProps) => {
	const { siteId, ads, networkCode } = getAdsAndGlobal(state, ownProps);
	const { user, networkConfig } = state.global;

	return {
		loading: !ads.fetched,
		ads: ads.content,
		user: user.data,
		siteId,
		networkCode,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	fetchAds: payload => dispatch(fetchAds(payload)),
	updateAd: (adId, siteId, payload) => dispatch(updateAd(adId, siteId, payload)),
	modifyAdOnServer: (siteId, adId, payload) => dispatch(modifyAdOnServer(siteId, adId, payload)),
	masterSave: (adsToUpdate, siteId, dataForAuditLogs) => dispatch(masterSave(adsToUpdate, siteId, dataForAuditLogs))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AdList);
