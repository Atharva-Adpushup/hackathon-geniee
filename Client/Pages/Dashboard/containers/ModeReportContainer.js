import { connect } from 'react-redux';
import ModeReport from '../components/ModeReport';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { site, metrics, filter }
		}
	} = state.global;
	return {
		...ownProps,
		site,
		metrics,
		filter
	};
};

export default connect(mapStateToProps)(ModeReport);
