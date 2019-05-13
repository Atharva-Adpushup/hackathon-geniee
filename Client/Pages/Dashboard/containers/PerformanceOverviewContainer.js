import { connect } from 'react-redux';
import PerformanceOverview from '../components/PerformanceOverview';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { site, metrics }
		}
	} = state.global;
	return {
		...ownProps,
		metrics,
		site
	};
};

export default connect(mapStateToProps)(PerformanceOverview);
