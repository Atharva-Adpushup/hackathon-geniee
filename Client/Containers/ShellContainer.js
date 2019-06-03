import { connect } from 'react-redux';
import Shell from '../Components/Shell/index';
import fetchGlobalData from '../actions/globalActions';
import { showNotification } from '../actions/uiActions';
import { switchUser, logout, findUsers } from '../actions/userActions';

const mapStateToProps = (state, ownProps) => {
	const { user, reports } = state.global;
	return {
		userFetched: user.fetched,
		user: user.data,
		reportsFetched: reports.fetched,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	fetchGlobalData: () => dispatch(fetchGlobalData()),
	showNotification: data => dispatch(showNotification(data)),
	switchUser: email => dispatch(switchUser(email)),
	logout: () => dispatch(logout()),
	findUsers: () => dispatch(findUsers())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Shell);
