import { connect } from 'react-redux';
import MySites from '../components/index';

const mapStateToProps = (state, ownProps) => {
	const {
		user: {
			data: { sites }
		}
	} = state.global;

	return {
		sites,
		...ownProps
	};
};

const mapDispatchToProps = () => ({});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MySites);
