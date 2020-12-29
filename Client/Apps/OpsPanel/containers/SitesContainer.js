import { connect } from 'react-redux';
import Sites from '../components/Settings/Sites';
import { showNotification } from '../../../actions/uiActions';
import { saveSettings } from '../../../actions/siteActions';

const mapStateToProps = (state, ownProps) => {
	const { user, sites } = state.global;

	return {
		fetched: sites.fetched,
		sites: sites.data,
		user: user.data,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data)),
	saveSettings: (siteId, data, dataForAuditLogs) =>
		dispatch(saveSettings(siteId, data, dataForAuditLogs))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Sites);
