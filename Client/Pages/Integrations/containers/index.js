import { connect } from 'react-redux';
import Integrations from '../components/index';

const mapStateToProps = (state, ownProps) => {
	const {
		user: { data: user }
	} = state.global;

	return {
		user,
		...ownProps
	};
};

const mapDispatchToProps = () => ({});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Integrations);
