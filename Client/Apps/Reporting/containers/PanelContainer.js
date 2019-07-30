import { connect } from 'react-redux';
import Panel from '../components/Panel';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { filter, metrics, dimension, interval, sites }
		}
	} = state.global;
	return {
		...ownProps,
		filter,
		metrics,
		dimension,
		interval,
		sites
	};
};

export default connect(mapStateToProps)(Panel);
