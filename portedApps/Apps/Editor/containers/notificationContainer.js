import { connect } from 'react-redux';
import { hideNotification } from 'actions/uiActions';
import Notification from '../components/outer/notifications/index';

const mapStateToProps = state => ({
		isVisible: state.ui.notifications.isVisible,
		mode: state.ui.notifications.mode,
		message: state.ui.notifications.message,
		title: state.ui.notifications.title
	}),
	mapDispatchToProps = dispatch => ({
		hideNotification: () => dispatch(hideNotification())
	});

export default connect(mapStateToProps, mapDispatchToProps)(Notification);
