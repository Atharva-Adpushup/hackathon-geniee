import { connect } from 'react-redux';
import Panel from '../components/Panel';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { filter, metrics, dimension, interval, site }
		}
	} = state.global;
	return {
		...ownProps,
		filter,
		metrics,
		dimension,
		interval,
		sites:site
	};
};

export default connect(mapStateToProps)(Panel);
