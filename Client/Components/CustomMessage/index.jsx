import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const getClassnames = type => {
	switch (type) {
		case 'error':
			return 'u-text-error';
		case 'success':
			return 'u-text-success';
		default:
		case 'info':
			return 'u-text-info';
	}
};

const CustomMessage = props => {
	// const [visible, setVisible] = useState(true);
	const { header, message, type, rootClassNames } = props;
	const classNames = getClassnames(type);

	return (
		<div
			className={`custom-message u-margin-b2 u-padding-v4 u-padding-h3 ${classNames} ${rootClassNames}`}
		>
			<h3 className="aligner aligner--row u-padding-h4 u-text-bold u-margin-0">
				<span className="aligner-item aligner aligner--hStart">{header}</span>
				<div className="aligner-item aligner aligner--hEnd">
					<FontAwesomeIcon
						icon="times"
						className="u-cursor-pointer"
						onClick={() => setVisible(false)}
					/>
				</div>
			</h3>
			<hr className="u-margin-v3" />
			<p className="u-margin-0 u-padding-h4" dangerouslySetInnerHTML={{ __html: message }} />
		</div>
	);
};

CustomMessage.propTypes = {
	header: PropTypes.string,
	message: PropTypes.string,
	type: PropTypes.string,
	rootClassNames: PropTypes.string
};

CustomMessage.defaultProps = {
	header: 'Header',
	message: 'Message',
	type: 'info',
	rootClassNames: ''
};

export default CustomMessage;
