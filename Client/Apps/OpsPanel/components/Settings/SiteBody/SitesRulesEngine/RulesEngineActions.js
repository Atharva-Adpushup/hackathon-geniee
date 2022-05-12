import React from 'react';
import Select from 'react-select';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, FormControl } from '@/Client/helpers/react-bootstrap-imports';
import { RULES_ENGINE } from '../../../../configs/commonConsts';

// import CustomToggleSwitch from '../../../Components/CustomToggleSwitch';

// TODO: group inventories

const getDropdownStyles = error => ({
	control: styles => ({
		...styles,
		borderColor: error ? 'red' : styles.borderColor,
		boxShadow: error ? 'none' : styles.boxShadow
	}),
	multiValue: (base, state) => (state.data.isFixed ? { ...base, backgroundColor: 'gray' } : base),
	multiValueLabel: (base, state) =>
		state.data.isFixed ? { ...base, fontWeight: 'bold', color: 'white', paddingRight: 6 } : base,
	multiValueRemove: (base, state) => (state.data.isFixed ? { ...base, display: 'none' } : base)
});

class SiteRuleActions extends React.Component {
	// common
	getTextNode = text => <span className="text">{text}</span>;

	getActionTemplate = () => ({
		key: null,
		value: [],
		typeError: null,
		valueError: null
	});

	// -------------------------- rendering --------------------------

	renderAddActionButton() {
		const { actions, dropdownOptions, onAddAction, isForOps } = this.props;

		const { keyOptions } = dropdownOptions;
		const supportedOptions = keyOptions.filter(option => !option.isNotSupported);
		const consumedAllSupportedOptions = isForOps
			? actions.length === supportedOptions.length
			: actions.length >= supportedOptions.length;

		return (
			<Button
				className="add-action btn-primary"
				onClick={onAddAction}
				disabled={consumedAllSupportedOptions}
				title={consumedAllSupportedOptions ? 'You have added all the available Actions' : ''}
			>
				Add New Action
			</Button>
		);
	}

	renderKeyDropdown(index, action, onChangeHandler, isIgnored) {
		const { dropdownOptions } = this.props;
		let { keyOptions } = dropdownOptions;

		keyOptions = keyOptions.map(option => ({
			...option,
			isDisabled:
				option.isDisabled === true || typeof option.selectedFor !== 'undefined'
					? option.selectedFor !== index
					: false
		}));

		const { key: currentValue, keyError: error } = action;

		const selectedOption = currentValue
			? keyOptions.find(option => option.value === currentValue)
			: null;

		const styles = getDropdownStyles(error);

		return (
			<div className="dropdown action-dropdown">
				<Select
					isDisabled={isIgnored}
					styles={styles}
					menuPlacement="auto"
					placeholder="Select Action"
					options={keyOptions}
					onChange={e => onChangeHandler(index, e)}
					value={selectedOption}
				/>
				{error && !isIgnored && <p className="error-message">{error}</p>}
			</div>
		);
	}

	renderRemoveActionButton(index) {
		const { onRemoveAction } = this.props;
		return (
			<Button className="remove-action btn--secondary" onClick={() => onRemoveAction(index)}>
				Delete
			</Button>
		);
	}

	renderValueElement(index, action, onChangeHandler, isIgnored) {
		const { dropdownOptions } = this.props;
		const { valueOptions } = dropdownOptions;

		const { key: elementType, value: currentValue, valueError: error } = action;

		const radioElementTypes = RULES_ENGINE.RULE_ENGINE_KEY_OPTIONS_TYPE.RADIO_ELEMENT_TYPES;
		const numberElementTypes = RULES_ENGINE.RULE_ENGINE_KEY_OPTIONS_TYPE.NUMBER_ELEMENT_TYPE;
		const dropdownElementTypes = RULES_ENGINE.RULE_ENGINE_KEY_OPTIONS_TYPE.DROP_DOWN;
		const multiDropdownElementTypes = RULES_ENGINE.RULE_ENGINE_KEY_OPTIONS_TYPE.DROP_DOWN_MULTI;
		if (
			dropdownElementTypes.includes(elementType) ||
			multiDropdownElementTypes.includes(elementType)
		) {
			const validCurrentValue = Array.isArray(currentValue) ? currentValue : currentValue;

			const options = valueOptions[elementType] || [];
			let selectedOption = null;
			if (Array.isArray(validCurrentValue)) {
				selectedOption = options.filter(option => validCurrentValue.includes(option.value));
			} else {
				selectedOption = options.find(option => option.value === currentValue);
			}

			const styles = getDropdownStyles(error);

			return (
				<div className="dropdown value-dropdown dropdown--full-width">
					<Select
						isDisabled={isIgnored}
						styles={styles}
						menuPlacement="auto"
						options={options}
						isMulti={multiDropdownElementTypes.includes(elementType)}
						value={selectedOption}
						isClearable={
							multiDropdownElementTypes.includes(elementType) &&
							!selectedOption.some(option => option.isFixed)
						}
						onChange={e => onChangeHandler(index, 'dropdown', e)}
					/>
					{error && <p className="error-message">{error}</p>}
				</div>
			);
		}

		if (numberElementTypes.includes(elementType)) {
			return (
				<div className={`number ${error ? 'error' : ''}`}>
					<FormControl
						disabled={isIgnored}
						type="number"
						min={0}
						max={10000}
						onFocus={e => e.target.select()}
						value={currentValue}
						onChange={e => onChangeHandler(index, 'number', e)}
						placeholder="(in seconds)"
					/>

					<p className="label">(in Seconds) Min: 0s | Max: 10000s</p>
					{error && <p className="error-message">{error}</p>}
				</div>
			);
		}

		if (radioElementTypes.includes(elementType)) {
			// nothing to be rendered

			return null;
		}

		return null;
	}

	renderData() {
		const { actions, onKeyChange, onValueChange } = this.props;

		return actions.length === 0 ? (
			<div className="empty-state">
				No actions added! Press the Add Action button to start adding actions
			</div>
		) : (
			actions.map((action, index) => {
				const { key, isIgnored = false, isIgnoredMessage, typeError, valueError } = action;

				return (
					<div
						className={`container-body action ${typeError || valueError ? 'error' : ''} ${
							isIgnored ? `ignored` : ``
						}`}
						// eslint-disable-next-line react/no-array-index-key
						key={`action-${key}-${index}`}
					>
						<DndProvider backend={HTML5Backend}>
							<div className="col-1">{this.getTextNode(`Action - ${index + 1}`)}</div>
							<div className="col-2 content">
								{this.renderKeyDropdown(index, action, onKeyChange, isIgnored)}
								{this.renderValueElement(index, action, onValueChange, isIgnored)}
							</div>

							{this.renderRemoveActionButton(index)}
						</DndProvider>
						{isIgnored && <p className="ignored-message">{isIgnoredMessage}</p>}
					</div>
				);
			})
		);
	}

	render() {
		return (
			<div className="actions-container u-margin-b4">
				<div className="container-header">
					<h3 className="container-title">Actions</h3>
				</div>
				{this.renderData()}
				<div className="container-footer">{this.renderAddActionButton()}</div>
			</div>
		);
	}
}

export default SiteRuleActions;
