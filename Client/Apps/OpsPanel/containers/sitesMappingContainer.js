import { connect } from 'react-redux';
import { fetchSites } from '../actions/siteMappingActions';
import SitesMapping from '../components/SitesMapping/index';

const mapStateToProps = (state, ownProps) => ({
		sites: state.sites
	}),
	mapDispatchToProps = dispatch => ({
		fetchSites: () => dispatch(fetchSites())
	});

export default connect(mapStateToProps, mapDispatchToProps)(SitesMapping);
