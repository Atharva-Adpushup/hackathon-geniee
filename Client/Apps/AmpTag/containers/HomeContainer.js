import { connect } from 'react-redux';
import Home from '../components/Home/index';

const mapStateToProps = (state, ownProps) => {
	const { global: { user: { data = {} } = {} } = {} } = state;
	return {
		user: data,
		...ownProps
	};
};

const mapDispatchToProps = () => ({});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Home);
