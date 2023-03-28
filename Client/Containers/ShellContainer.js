import { connect } from 'react-redux';
import Shell from '../Components/Shell/index';
import { fetchGlobalData } from '../actions/globalActions';
import { showNotification } from '../actions/uiActions';
import {
	switchUser,
	impersonateCurrentUser,
	logout,
	findUsers as findUsersAction
} from '../actions/userActions';

const mapStateToProps = (state, ownProps) => {
	const {
		global: { user, sites, associatedAccounts, findUsers },
		apps: {
			headerBidding: { hasUnsavedChanges = false }
		}
	} = state;

	return {
		userFetched: user.fetched,
		user: user.data,
		sites: sites.data,
		associatedAccounts: associatedAccounts.data,
		// prevent unnecessary findUser req
		// if already fetched or fetching set the flag to false
		findUserFetching: findUsers.isFetching,
		findUserFetched: findUsers.fetched,
		hasUnsavedChanges,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	fetchGlobalData: () => dispatch(fetchGlobalData()),
	showNotification: data => dispatch(showNotification(data)),
	switchUser: email => dispatch(switchUser(email)),
	impersonateCurrentUser: () => dispatch(impersonateCurrentUser()),
	logout: () => dispatch(logout()),
	findUsers: options => dispatch(findUsersAction(options))
});

export default connect(mapStateToProps, mapDispatchToProps)(Shell);
