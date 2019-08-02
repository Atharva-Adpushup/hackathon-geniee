import { connect } from 'react-redux';
import Panel from '../components/Panel';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { filter, metrics, dimension, interval, site }
		},
		sites
	} = state.global;
	return {
		...ownProps,
		filter,
		metrics,
		dimension,
		interval,
		reportingSites: site,
		userSites: sites.fetched ? sites.data : {}
	};
};

export default connect(mapStateToProps)(Panel);
