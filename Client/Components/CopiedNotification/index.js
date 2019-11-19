import React from 'react';
import PropTypes from 'prop-types';
import '../../scss/shared/copiedNotification.scss';

class CopiedNotification extends React.Component {
	componentWillUnmount() {
		const { isVisible } = this.props;
		if (isVisible && this.timeoutId) clearTimeout(this.timeoutId);
	}

	setNotificationTimeout = autoHideTime => {
		const { hideCopiedNotification } = this.props;

		this.timeoutId = setTimeout(() => {
			hideCopiedNotification();
		}, autoHideTime);
	};

	timeoutId;

	render() {
		const { isVisible, message, autoHideTime } = this.props;

		if (isVisible) this.setNotificationTimeout(autoHideTime);

		return (
			<div className={`copy-notification${!isVisible ? ' hidden-notification' : ''}`}>
				{message}
			</div>
		);
	}
}

CopiedNotification.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	autoHideTime: PropTypes.number,
	message: PropTypes.string
};

CopiedNotification.defaultProps = {
	autoHideTime: 3000,
	message: 'Copied Successfully!'
};

export default CopiedNotification;
