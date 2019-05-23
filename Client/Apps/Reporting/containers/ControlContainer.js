import { connect } from 'react-redux';
import Control from '../components/Control';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { filter, metrics, dimension }
		}
	} = state.global;
	return {
		filter,
		metrics,
		dimension,
		...ownProps
	};
};

export default connect(mapStateToProps)(Control);
