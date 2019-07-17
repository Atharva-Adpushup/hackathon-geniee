import { connect } from 'react-redux';
import Control from '../components/Control';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { filter, metrics, dimension, interval, site }
		}
	} = state.global;
	return {
		filter,
		metrics,
		dimension,
		interval,
		site,
		...ownProps
	};
};

export default connect(mapStateToProps)(Control);
