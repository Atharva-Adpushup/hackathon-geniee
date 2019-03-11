import { connect } from 'react-redux';
import Shell from '../Components/Shell/index';
import { fetchGlobalData } from '../actions/globalActions';
import { showNotification } from '../actions/uiActions';

const mapStateToProps = (state, ownProps) => {
	const { user } = state.global;
	return {
		fetched: user.fetched,
		user: user.data,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	fetchGlobalData: () => dispatch(fetchGlobalData()),
	showNotification: data => dispatch(showNotification(data))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Shell);
