import { connect } from 'react-redux';
import { fetchAds, updateAd } from '../actions/adActions';
import { masterSave } from '../actions/globalActions';
import AdList from '../components/Home/AdList/index.jsx';

const mapStateToProps = (state, ownProps) => ({
		loading: !state.ads.fetched,
		ads: state.ads.content,
		...ownProps
	}),
	mapDispatchToProps = dispatch => ({
		fetchAds: payload => dispatch(fetchAds(payload)),
		updateAd: (adId, payload) => dispatch(updateAd(adId, payload)),
		masterSave: siteId => dispatch(masterSave(siteId))
	});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AdList);
