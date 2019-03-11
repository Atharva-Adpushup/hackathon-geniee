import { connect } from 'react-redux';
import { hideNotification, showNotification } from '../actions/uiActions';
import Notification from '../Components/Notification/index';

const mapStateToProps = state => {
	const { notifications } = state.global.ui;
	return {
		isVisible: notifications.isVisible,
		mode: notifications.mode,
		message: notifications.message,
		title: notifications.title,
		autoDismiss: notifications.autoDismiss
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: () => dispatch(showNotification()),
	hideNotification: () => dispatch(hideNotification())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Notification);
