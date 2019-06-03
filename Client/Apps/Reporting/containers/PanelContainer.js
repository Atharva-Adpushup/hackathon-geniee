import { connect } from 'react-redux';
import Panel from '../components/Panel';

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

export default connect(mapStateToProps)(Panel);
