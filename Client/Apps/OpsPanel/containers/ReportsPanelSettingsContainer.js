import { connect } from 'react-redux';
import ReportsPanelSettings from '../components/Settings/SiteBody/ReportsPanelSettings';
import { showNotification } from '../../../actions/uiActions';
import { updateUser } from '../../../actions/userActions';

const mapStateToProps = (state, ownProps) => {
	const { user } = state.global;
	return {
		fetched: user.fetched,
		user: user.data,
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
)(ReportsPanelSettings);
