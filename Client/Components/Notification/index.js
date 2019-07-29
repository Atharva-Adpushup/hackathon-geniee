import React, { Component } from 'react';
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
		const { mode, message, title, autoDismiss } = this.props;
		this._notificationSystem.addNotification({
			message,
			title,
			level: mode,
			autoDismiss: autoDismiss > 0 ? autoDismiss : 0,
			onRemove: notification => this.props.hideNotification()
		});
	}

	render() {
		const style = {
			Containers: {
				DefaultStyle: {
					top: '50',
					bottom: 'auto',
					left: 'auto',
					right: '0'
				}
			},
			NotificationItem: {
				// Override the notification item
				DefaultStyle: {
					// Applied to every notification, regardless of the notification level
					borderTopWidth: '5px',
					boxShadow: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)'
				}
			}
		};
		return (
			<div style={{ position: 'relative', zIndex: 1000000 }}>
				{this.props.isVisible ? this.createNotification() : null}
				<NotificationSystem ref="notificationSystem" allowHTML style={style} />
			</div>
		);
	}
}

export default Notification;
