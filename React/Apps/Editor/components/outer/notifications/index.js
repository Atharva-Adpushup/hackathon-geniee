import React, { Component } from 'react';
import 'react-notifications/lib/notifications.css';
import NotificationSystem from 'react-notification-system';

class Notification extends Component {
	constructor(props) {
		super(props);
		this.createNotification = this.createNotification.bind(this);
	}

	componentDidMount() {
		this._notificationSystem = this.refs.notificationSystem;
	}

	createNotification() {
		const { mode, message, title } = this.props;
		this._notificationSystem.addNotification({
			message: message,
			title: title,
			level: mode,
			dismissible: true,
			onRemove: notification => this.props.hideNotification()
		});
	}

	render() {
		return (
			<div style={{ position: 'relative', zIndex: 1000000 }}>
				{this.props.isVisible ? this.createNotification() : null}
				<NotificationSystem ref="notificationSystem" allowHTML={true} />
			</div>
		);
	}
}

export default Notification;
