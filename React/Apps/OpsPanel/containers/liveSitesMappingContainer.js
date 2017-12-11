import { connect } from 'react-redux';
import { fetchLiveSites } from '../actions/liveSitesMappingActions';
import LiveSitesMapping from '../components/LiveSitesMapping/index';

const mapStateToProps = (state, ownProps) => ({
		sites: state.livesites
	}),
	mapDispatchToProps = dispatch => ({
		fetchLiveSites: params => dispatch(fetchLiveSites(params))
	});

export default connect(mapStateToProps, mapDispatchToProps)(LiveSitesMapping);
