import { connect } from 'react-redux';
import Table from '../components/Table';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { metrics, dimension }
		}
	} = state.global;
	console.log(metrics, dimension);
	return {
		metrics,
		dimension,
		...ownProps
	};
};

export default connect(mapStateToProps)(Table);
