import { connect } from 'react-redux';
import MySites from '../components/index';
import { fetchAppStatuses } from '../../../actions/siteActions';

const mapStateToProps = (state, ownProps) => {
	const {
		user: {
			data: { sites, isSuperUser }
		},
		reports: {
			data: { site: reportSites }
		},
		sites: { data: globalSites }
	} = state.global;

	return {
		sites,
		reportSites,
		globalSites,
		isSuperUser,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	fetchAppStatuses: siteId => dispatch(fetchAppStatuses(siteId))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MySites);
