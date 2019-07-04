import { connect } from 'react-redux';
import MySites from '../components/index';
import { fetchAppStatuses } from '../../../actions/siteActions';

const mapStateToProps = (state, ownProps) => {
	const {
		user: {
			data: { sites }
		},
		reports: {
			data: { site: reportSites }
		}
	} = state.global;

	return {
		sites,
		reportSites,
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
