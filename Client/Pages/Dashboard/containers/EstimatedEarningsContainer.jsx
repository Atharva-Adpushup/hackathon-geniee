import { connect } from 'react-redux';
import EstimatedEarnings from '../components/EstimatedEarnings';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			account: {
				data: { site }
			}
		}
	} = state.global;
	return {
		...ownProps,
		site
	};
};

export default connect(mapStateToProps)(EstimatedEarnings);
