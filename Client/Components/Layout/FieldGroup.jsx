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

const FieldGroup = ({ id, label, help, type, buttonToggle, ...props }) => {
	const isToggleButtonGroup = !!(type === 'toggle-button-group' && buttonToggle);
	const buttonGroup = isToggleButtonGroup ? (
		<ButtonToolbar>
			<ToggleButtonGroup type="radio" name="options" defaultValue={1}>
				{map(buttonToggle, itemObject => (
					<ToggleButton value={itemObject.value}>{itemObject.text}</ToggleButton>
				))}
			</ToggleButtonGroup>
		</ButtonToolbar>
	) : null;

	return (
		<FormGroup controlId={id} className="u-margin-b4">
			<ControlLabel className="u-margin-b3">{label}</ControlLabel>
			{isToggleButtonGroup ? buttonGroup : <FormControl type={type} {...props} />}

			{help && <HelpBlock>{help}</HelpBlock>}
		</FormGroup>
	);
};

export default FieldGroup;
