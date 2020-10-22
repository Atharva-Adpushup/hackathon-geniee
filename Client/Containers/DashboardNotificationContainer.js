import { connect } from 'react-redux';
import Notification from '../Components/Shell/Notification';
import { replaceUnseenNotifications, addUnseenNotification } from '../actions/notificationActions';

const mapStateToProps = (state, ownProps) => {
	const {
		global: { notifications, sites }
	} = state;

	return {
		notifications: notifications.slice(0, 10),
		sites: sites.data,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	replaceUnseenNotifications: notifications => dispatch(replaceUnseenNotifications(notifications)),
	addUnseenNotification: notification => dispatch(addUnseenNotification(notification))
});

export default connect(mapStateToProps, mapDispatchToProps)(Notification);
