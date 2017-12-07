import { connect } from 'react-redux';
import { fetchSites } from '../actions/siteMappingActions';
import LiveSitesMapping from '../components/LiveSitesMapping/index';

const mapStateToProps = (state, ownProps) => ({
		sites: state.sites
	}),
	mapDispatchToProps = dispatch => ({
		fetchSites: () => dispatch(fetchSites())
	});

export default connect(mapStateToProps, mapDispatchToProps)(LiveSitesMapping);
