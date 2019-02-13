import { connect } from 'react-redux';
import Shell from '../Components/Shell/index';
import { fetchGlobalData } from '../actions/globalActions';

const mapStateToProps = (state, ownProps) => {
	const { user } = state.global;
	return {
		fetched: user.fetched,
		user: user.data,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	fetchGlobalData: () => dispatch(fetchGlobalData())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Shell);
