import { connect } from 'react-redux';
import Shell from '../Components/Shell/index';
import fetchGlobalData from '../actions/globalActions';
import { showNotification } from '../actions/uiActions';

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
	showNotification: data => dispatch(showNotification(data))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Shell);
