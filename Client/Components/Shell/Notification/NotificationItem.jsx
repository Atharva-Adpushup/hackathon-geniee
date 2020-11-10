/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import config from '../../../config/config';

const NotificationItem = ({ notification = {}, onClick }) => {
	const onVisibilityChanged = isVisible => {
		if (isVisible && !notification.hasRead) {
			window.navigator.sendBeacon(
				`${config.NOTIFICATION_SERVICE.HOST}/notification/read/${notification.id}`
			);
		}
	};

	return (
		<VisibilitySensor onChange={onVisibilityChanged}>
			<div className="u-padding-h4 hover" onClick={() => onClick(notification.id)}>
				<div className="notification-item-message">
					{/* <FontAwesomeIcon icon="bell" /> */}
					<p className>{notification.message}</p>
				</div>
				<span className="font-small pull-right notification-sub">
					{new Date(notification.dateCreated).toDateString()}
				</span>
			</div>
		</VisibilitySensor>
	);
};

export default NotificationItem;
