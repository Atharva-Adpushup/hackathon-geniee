import { connect } from 'react-redux';
import PerformanceApOriginal from '../components/PerformanceApOriginal';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			account: {
				data: { site, metrics }
			}
		}
	} = state.global;
	return {
		...ownProps,
		site,
		metrics
	};
};

export default connect(mapStateToProps)(PerformanceApOriginal);
