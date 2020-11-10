import { connect } from 'react-redux';
import NotificationHistory from '../Pages/NotificationHistory';
import { appendNotifications } from '../actions/notificationActions';

const mapStateToProps = (state, ownProps) => {
	const {
		global: { notifications, sites }
	} = state;

	return {
		notifications,
		sites: sites.data,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	appendNotifications: notifications => dispatch(appendNotifications(notifications))
});

export default connect(mapStateToProps, mapDispatchToProps)(NotificationHistory);
