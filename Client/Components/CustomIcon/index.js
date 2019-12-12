import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CustomIcon = props => {
	const { classNames, icon, onClick, toReturn, ...rest } = props;

	function clickHandler(e) {
		return onClick(toReturn, e);
	}

	return <FontAwesomeIcon icon={icon} className={classNames} onClick={clickHandler} {...rest} />;
};

CustomIcon.propTypes = {
	classNames: PropTypes.string,
	icon: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	toReturn: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number,
		PropTypes.bool,
		PropTypes.array,
		PropTypes.object,
		PropTypes.element
	])
};

CustomIcon.defaultProps = {
	classNames: '',
	onClick: () => {},
	toReturn: ''
};

export default CustomIcon;
