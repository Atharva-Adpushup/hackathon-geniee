import { connect } from 'react-redux';
import Chart from '../components/Chart';

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

export default connect(mapStateToProps)(Chart);
