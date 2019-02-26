import { connect } from 'react-redux';
import { fetchMeta } from '../../../actions/apps/innovativeAds/globalActions';
import Home from '../components/Home/index';

const mapStateToProps = (state, ownProps) => ({
	meta: state.apps.innovativeAds.global.meta,
	...ownProps
});

const mapDispatchToProps = dispatch => ({
	fetchMeta: siteId => dispatch(fetchMeta(siteId))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Home);
