import React from 'react';
import PropTypes from 'prop-types';

const InputBox = ({ classNames, type, name, value, placeholder, onChange, ...props }) => (
	<input
		className={`input--minimal ${classNames}`}
		type={type}
		name={name}
		value={value}
		placeholder={placeholder}
		onChange={onChange}
		{...props}
	/>
);

InputBox.propTypes = {
	type: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	classNames: PropTypes.string,
	value: PropTypes.string,
	placeholder: PropTypes.string,
	onChange: PropTypes.func
};

InputBox.defaultProps = {
	classNames: '',
	value: null,
	placeholder: 'Enter value',
	onChange: () => {}
};

export default InputBox;
