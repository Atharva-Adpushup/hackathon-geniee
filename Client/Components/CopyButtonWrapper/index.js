/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import * as clipboard from 'clipboard-polyfill';
import '../../scss/shared/copiedNotification.scss';

class CopyButtonWrapper extends React.Component {
	state = {
		showNotification: false
	};

	componentWillUnmount() {
		const { showNotification } = this.state;
		if (showNotification && this.timeoutId) clearTimeout(this.timeoutId);
	}

	onCopy = () => {
		const {
			content,
			message,
			autoHideTime,
			showCopiedNotification: showCopiedNotificationAction
		} = this.props;
		clipboard.writeText(content);

		showCopiedNotificationAction(message, autoHideTime);
	};

	timeoutId;

	render() {
		const { children } = this.props;

		return (
			<span className="u-cursor-pointer" onClick={this.onCopy}>
				{children}
			</span>
		);
	}
}

CopyButtonWrapper.propTypes = {
	autoHideTime: PropTypes.number,
	content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	children: PropTypes.element.isRequired,
	message: PropTypes.string
};

CopyButtonWrapper.defaultProps = {
	autoHideTime: 3000,
	message: 'Successfully Copied!'
};

export default CopyButtonWrapper;
