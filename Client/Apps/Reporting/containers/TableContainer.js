import { connect } from 'react-redux';
import Table from '../components/Table';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { metrics, dimension, site }
		}
	} = state.global;
	return {
		metrics,
		dimension,
		site,
		...ownProps
	};
};

export default connect(mapStateToProps)(Table);
