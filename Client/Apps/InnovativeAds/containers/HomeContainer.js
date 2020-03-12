import { connect } from 'react-redux';
import { fetchMeta } from '../../../actions/apps/innovativeAds/globalActions';
import { fetchAds } from '../../../actions/apps/innovativeAds/adActions';
import Home from '../components/Home/index';
import { DEFAULT_ADS_RESPONSE } from '../configs/commonConsts';
import { getAdsAndGlobal } from '../lib/helpers';

const mapStateToProps = (state, ownProps) => {
	const { ads, global } = getAdsAndGlobal(state, ownProps);
	const { global: { user: { data = {} } = {} } = {} } = state;
	const meta = global && global.meta ? global.meta : DEFAULT_ADS_RESPONSE;

	return {
		ads: ads.content,
		loading: !ads.fetched,
		meta,
		user: data,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	fetchAds: siteId => dispatch(fetchAds(siteId)),
	fetchMeta: siteId => dispatch(fetchMeta(siteId))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Home);
