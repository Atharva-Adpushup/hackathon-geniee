import { connect } from 'react-redux';
import Revenue from '../components/Revenue';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { site, metrics }
		}
	} = state.global;
	return {
		...ownProps,
		site,
		metrics
	};
};

export default connect(mapStateToProps)(Revenue);
