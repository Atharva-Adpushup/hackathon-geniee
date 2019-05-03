import { connect } from 'react-redux';
import SitewiseReport from '../components/SitewiseReport';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { metrics: metrics }
		}
	} = state.global;
	return {
		...ownProps,
		metrics
	};
};

export default connect(mapStateToProps)(SitewiseReport);
