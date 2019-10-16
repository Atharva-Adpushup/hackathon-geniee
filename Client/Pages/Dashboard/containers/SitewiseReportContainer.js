import { connect } from 'react-redux';
import SitewiseReport from '../components/SitewiseReport';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			account: {
				data: { metrics, site }
			}
		}
	} = state.global;

	return {
		...ownProps,
		metrics,
		site
	};
};

export default connect(mapStateToProps)(SitewiseReport);
