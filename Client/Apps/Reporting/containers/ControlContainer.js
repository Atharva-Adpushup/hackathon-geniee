import { connect } from 'react-redux';
import Control from '../components/Control';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { filter, metrics, dimension, interval }
		}
	} = state.global;
	return {
		filter,
		metrics,
		dimension,
		interval,
		...ownProps
	};
};

export default connect(mapStateToProps)(Control);
