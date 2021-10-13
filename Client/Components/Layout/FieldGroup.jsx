/* eslint-disable react/forbid-prop-types */
import React from 'react';
import map from 'lodash/map';
import PropTypes from 'prop-types';

import {
	FormGroup,
	ControlLabel,
	HelpBlock,
	FormControl,
	ButtonToolbar,
	ToggleButtonGroup,
	ToggleButton
} from '@/Client/helpers/react-bootstrap-imports';
import SelectBox from '../SelectBox/index';

const FieldGroup = ({
	id,
	label,
	help,
	type,
	itemCollection,
	onChange,
	value,
	isTextOnly,
	textOnlyStyles,
	dataKey,
	toggleGroupType,
	fileDropdownValue,
	onFileDropdownChange,
	fileDropdownTitle,
	...props
}) => {
	const isToggleButtonGroup = !!(type === 'toggle-button-group' && itemCollection);
	const isDropDownButton = !!(type === 'toggle-dropdown-button' && itemCollection);
	const isFileSelectDropdownGroup = !!(type === 'toggle-file-select-group' && itemCollection);
	const buttonGroup = isToggleButtonGroup ? (
		<ButtonToolbar>
			<ToggleButtonGroup
				onChange={onChange}
				type={toggleGroupType}
				name="options"
				value={value}
				defaultValue={1}
			>
				{map(itemCollection, (itemObject, key) => (
					<ToggleButton key={`toggle-button-${key}`} value={itemObject.value}>
						{itemObject.text}
					</ToggleButton>
				))}
			</ToggleButtonGroup>
		</ButtonToolbar>
	) : null;
	const dropdownButton = isDropDownButton ? (
		<SelectBox
			selected={value}
			onSelect={onChange}
			title={label}
			id={id}
			options={itemCollection}
			dataKey={dataKey}
		/>
	) : null;

	const fileSelectWithDropdown = isFileSelectDropdownGroup ? (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'space-evenly',
				float: 'right',
				fontWeight: 700
			}}
		>
			<div style={{ width: '200px' }}>
				<SelectBox
					selected={fileDropdownValue}
					onSelect={onFileDropdownChange}
					title={fileDropdownTitle}
					id={`${id}-dropdown`}
					options={itemCollection}
					dataKey={dataKey}
				/>
			</div>

			<FormControl
				type="file"
				onChange={onChange}
				value={value}
				id={`${id}-file`}
				style={{ width: '50%' }}
				{...props}
			/>
		</div>
	) : null;

	const textComponent =
		isTextOnly && !type ? (
			<span style={{ display: 'block', ...textOnlyStyles }}>{value}</span>
		) : null;
	let computedComponent = null;

	if (isToggleButtonGroup) {
		computedComponent = buttonGroup;
	} else if (isDropDownButton) {
		computedComponent = dropdownButton;
	} else if (isFileSelectDropdownGroup) {
		computedComponent = fileSelectWithDropdown;
	} else if (isTextOnly) {
		computedComponent = textComponent;
	} else {
		computedComponent = <FormControl type={type} onChange={onChange} value={value} {...props} />;
	}

	return (
		<FormGroup controlId={id} className="u-margin-b4">
			{label ? <ControlLabel className="u-margin-b3">{label}</ControlLabel> : null}
			{computedComponent}
			{help && <HelpBlock>{help}</HelpBlock>}
		</FormGroup>
	);
};
FieldGroup.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
	onChange: PropTypes.func,
	help: PropTypes.string,
	type: PropTypes.string,
	itemCollection: PropTypes.array,
	isTextOnly: PropTypes.bool,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
	dataKey: PropTypes.string,
	toggleGroupType: PropTypes.string,
	textOnlyStyles: PropTypes.object,
	fileDropdownValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
	onFileDropdownChange: PropTypes.func,
	fileDropdownTitle: PropTypes.string
};
FieldGroup.defaultProps = {
	help: '',
	type: '',
	itemCollection: [],
	isTextOnly: false,
	value: '',
	dataKey: '',
	toggleGroupType: 'radio',
	onChange: () => {},
	textOnlyStyles: {},
	fileDropdownValue: '',
	onFileDropdownChange: () => {},
	fileDropdownTitle: ''
};
export default FieldGroup;
