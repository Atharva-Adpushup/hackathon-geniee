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
			message: message,
			title: title,
			level: mode,
			autoDismiss: autoDismiss >= 0 || 5,
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
			}
		};
		return (
			<div style={{ position: 'relative', zIndex: 1000000 }}>
				{this.props.isVisible ? this.createNotification() : null}
				<NotificationSystem ref="notificationSystem" allowHTML={true} style={style} />
			</div>
		);
	}
}

export default Notification;
