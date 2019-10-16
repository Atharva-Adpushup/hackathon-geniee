import { connect } from 'react-redux';
import Revenue from '../components/Revenue';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			account: {
				data: { site, metrics, filter }
			}
		}
	} = state.global;
	return {
		...ownProps,
		site,
		metrics,
		filter
	};
};

export default connect(mapStateToProps)(Revenue);
