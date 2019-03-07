import { connect } from 'react-redux';
import { hideNotification } from '../actions/uiActions';
import Notification from '../Components/Notification/index';

const mapStateToProps = state => ({
	isVisible: state.global.ui.notifications.isVisible,
	mode: state.global.ui.notifications.mode,
	message: state.global.ui.notifications.message,
	title: state.global.ui.notifications.title,
	autoDismiss: state.global.ui.notifications.autoDismiss
});

const mapDispatchToProps = dispatch => ({
	hideNotification: () => dispatch(hideNotification())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Notification);
