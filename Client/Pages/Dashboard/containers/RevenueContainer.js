import { connect } from 'react-redux';
import Revenue from '../components/Revenue';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { site }
		}
	} = state.global;
	return {
		...ownProps,
		site
	};
};

export default connect(mapStateToProps)(Revenue);
