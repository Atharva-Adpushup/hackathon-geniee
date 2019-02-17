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

const FieldGroup = ({ id, label, help, type, buttonToggle, onChange, ...props }) => {
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

	return (
		<FormGroup controlId={id} className="u-margin-b4">
			<ControlLabel className="u-margin-b3">{label}</ControlLabel>
			{isToggleButtonGroup ? (
				buttonGroup
			) : (
				<FormControl type={type} onChange={onChange} {...props} />
			)}

			{help && <HelpBlock>{help}</HelpBlock>}
		</FormGroup>
	);
};

FieldGroup.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	help: PropTypes.string,
	type: PropTypes.string,
	buttonToggle: PropTypes.array
};

FieldGroup.defaultProps = {
	id: 'Simple-field-group-1',
	label: 'Simple field group',
	onChange: () => {
		console.log('Fieldgroup component changed');
	},
	type: 'text'
};

export default FieldGroup;
