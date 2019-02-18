import React from 'react';
import { map } from 'lodash';
import {
	FormGroup,
	ControlLabel,
	HelpBlock,
	FormControl,
	ButtonToolbar,
	ToggleButtonGroup,
	ToggleButton
} from 'react-bootstrap';
import PropTypes from 'prop-types';

const FieldGroup = ({
	id,
	label,
	help,
	type,
	buttonToggle,
	onChange,
	value,
	isTextOnly,
	...props
}) => {
	const isToggleButtonGroup = !!(type === 'toggle-button-group' && buttonToggle);
	const buttonGroup = isToggleButtonGroup ? (
		<ButtonToolbar>
			<ToggleButtonGroup onChange={onChange} type="radio" name="options" defaultValue={1}>
				{map(buttonToggle, (itemObject, key) => (
					<ToggleButton key={`toggle-button-${key}`} value={itemObject.value}>
						{itemObject.text}
					</ToggleButton>
				))}
			</ToggleButtonGroup>
		</ButtonToolbar>
	) : null;
	const textComponent =
		isTextOnly && !type ? <span style={{ display: 'block' }}>{value}</span> : null;
	let computedComponent = null;

	if (isToggleButtonGroup) {
		computedComponent = buttonGroup;
	} else if (isTextOnly) {
		computedComponent = textComponent;
	} else {
		computedComponent = <FormControl type={type} onChange={onChange} value={value} {...props} />;
	}

	return (
		<FormGroup controlId={id} className="u-margin-b4">
			<ControlLabel className="u-margin-b3">{label}</ControlLabel>
			{computedComponent}

			{help && <HelpBlock>{help}</HelpBlock>}
		</FormGroup>
	);
};

FieldGroup.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	onChange: PropTypes.func,
	help: PropTypes.string,
	type: PropTypes.string,
	buttonToggle: PropTypes.array,
	isTextOnly: PropTypes.bool,
	value: PropTypes.string
};

FieldGroup.defaultProps = {
	help: '',
	type: '',
	buttonToggle: [],
	isTextOnly: false,
	value: '',
	onChange: () => {}
};

export default FieldGroup;
