import { connect } from 'react-redux';
import {
	fetchAmpAds,
	updateAmpAd,
	modifyAmpAdOnServer
} from '../../../actions/apps/amp/ampAdActions';
import { masterSaveAmp } from '../../../actions/apps/amp/globalActions';
import AmpAdList from '../components/Home/AmpAdList/index';
import { getAdsAndGlobalForAmpNew } from '../lib/helpers';

const mapStateToProps = (state, ownProps) => {
	const { siteId, ads, networkCode } = getAdsAndGlobalForAmpNew(state, ownProps);
	const { user } = state.global;

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
	fetchAmpAds: payload => dispatch(fetchAmpAds(payload)),
	updateAmpAd: (adId, siteId, payload) => dispatch(updateAmpAd(adId, siteId, payload)),
	modifyAmpAdOnServer: (siteId, adId, payload, dataForAuditLogs) =>
		dispatch(modifyAmpAdOnServer(siteId, adId, payload, dataForAuditLogs)),
	masterSaveAmp: (adsToUpdate, siteId, dataForAuditLogs) =>
		dispatch(masterSaveAmp(adsToUpdate, siteId, dataForAuditLogs))
});

export default connect(mapStateToProps, mapDispatchToProps)(AmpAdList);
