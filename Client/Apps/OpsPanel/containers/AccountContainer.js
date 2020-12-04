import { connect } from 'react-redux';
import Account from '../components/Settings/Account';
import { showNotification } from '../../../actions/uiActions';
import { updateUser } from '../../../actions/userActions';

const mapStateToProps = (state, ownProps) => {
	const { user, sites } = state.global;
	return {
		fetched: user.fetched,
		user: user.data,
		sites: sites.data,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data)),
	updateUser: (data, dataForAuditLogs) => dispatch(updateUser(data, dataForAuditLogs))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Account);
