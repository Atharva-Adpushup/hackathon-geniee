import { connect } from 'react-redux';
import { fetchMeta } from '../../../actions/apps/innovativeAds/globalActions';
import Home from '../components/Home/index';
import { DEFAULT_ADS_RESPONSE } from '../configs/commonConsts';

const mapStateToProps = (state, ownProps) => {
	const { innovativeAds } = state.apps;
	const { global } = innovativeAds;
	const {
		match: { params }
	} = ownProps;
	const meta =
		global[params.siteId] && global[params.siteId].meta
			? global[params.siteId].meta
			: DEFAULT_ADS_RESPONSE;

	return {
		meta,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	fetchMeta: siteId => dispatch(fetchMeta(siteId))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Home);
