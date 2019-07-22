import { connect } from 'react-redux';
import ManageSite from '../components/index';

const mapStateToProps = (state, ownProps) => {
	const { user } = state.global;
	return {
		user: user.data,
		...ownProps
	};
};

const mapDispatchToProps = () => ({});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ManageSite);
