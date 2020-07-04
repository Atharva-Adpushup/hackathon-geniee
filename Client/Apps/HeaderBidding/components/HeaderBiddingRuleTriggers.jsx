import React from 'react';
import Select from 'react-select';
import { countries } from 'country-data';
import { Button } from '@/Client/helpers/react-bootstrap-imports';

// TODO: duplicate united kingdom in countries list

const countriesList = Object.values(countries.all).map(({ name }) => name);
const uniqueCountriesList = [...new Set(countriesList)];

const dropdownErrorStyle = {
	control: styles => ({
		...styles,
		borderColor: 'red',
		boxShadow: 'none'
	})
};

class HeaderBiddingRuleTriggers extends React.Component {
	// common
	getTextNode = text => <span className="text">{text}</span>;

	getTriggerTemplate = () => ({
		key: null,
		operator: null,
		value: [],
		keyError: null,
		operatorError: null,
		valueError: null
	});

	// -------------------------- rendering --------------------------

	renderKeyDropdown(index, trigger) {
		const { dropdownOptions, onKeyChange: onChangeHandler } = this.props;
		let { keyOptions } = dropdownOptions;

		keyOptions = keyOptions.map(option => ({
			...option,
			isDisabled:
				option.isDisabled === true || typeof option.selectedFor !== 'undefined'
					? option.selectedFor !== index
					: false
		}));

		const { key: currentValue, keyError: error } = trigger;

		const selectedOption = currentValue
			? keyOptions.find(option => option.value === currentValue)
			: null;

		const styles = error ? dropdownErrorStyle : {};

		return (
			<div className="dropdown trigger-dropdown">
				<Select
					styles={styles}
					placeholder="Select Trigger"
					options={keyOptions}
					onChange={e => onChangeHandler(index, e)}
					value={selectedOption}
				/>

				{error && <p className="error-message">{error}</p>}
			</div>
		);
	}

	renderOperatorDropdown(index, trigger) {
		const { dropdownOptions, onOperatorChange: onChangeHandler } = this.props;
		const { operatorOptions } = dropdownOptions;

		const { operator: currentValue, operatorError: error } = trigger;

		// const operatorOptions = getDropdownOptions('trigger-operator');
		const selectedOption = currentValue
			? operatorOptions.find(option => option.value === currentValue)
			: null;

		const styles = error ? dropdownErrorStyle : {};

		return (
			<div className="dropdown trigger-dropdown">
				<Select
					styles={styles}
					placeholder="Select Operator"
					options={operatorOptions}
					onChange={e => onChangeHandler(index, e)}
					value={selectedOption}
				/>

				{error && <p className="error-message">{error}</p>}
			</div>
		);
	}

	renderValueDropdown(index, trigger) {
		const { dropdownOptions, onValueChange: onChangeHandler } = this.props;
		const { valueOptions } = dropdownOptions;

		const { key, operator, value: currentValue, valueError: error } = trigger;

		const options = valueOptions[key] || [];

		const fullWidthDropdown = ['country', 'adunit'];
		const spanDropdownFullWidth = fullWidthDropdown.includes(key);

		const selectedOption = currentValue
			? options.filter(option => currentValue.includes(option.value))
			: null;

		const styles = error ? dropdownErrorStyle : {};

		return (
			<div
				className={`dropdown value-dropdown ${spanDropdownFullWidth ? 'dropdown--full-width' : ''}`}
			>
				{key && operator && (
					<Select
						isMulti
						styles={styles}
						options={options}
						value={selectedOption}
						onChange={e => onChangeHandler(index, e)}
					/>
				)}
				{error && <p className="error-message">{error}</p>}
			</div>
		);
	}

	renderAddTriggerButton() {
		// disable when all the trigger keys are consumed
		const { triggers, dropdownOptions, onAddTrigger } = this.props;
		const { keyOptions } = dropdownOptions;
		const supportedOptions = keyOptions.filter(option => !option.isNotSupported);
		const consumedAllSupportedOptions = triggers.length >= supportedOptions.length;

		return (
			<Button
				className="add-trigger"
				onClick={onAddTrigger}
				disabled={consumedAllSupportedOptions}
				title={consumedAllSupportedOptions ? 'You have added all the available Triggers' : ''}
			>
				Add Trigger
			</Button>
		);
	}

	renderRemoveTriggerButton(index) {
		const { onRemoveTrigger } = this.props;

		return (
			<Button className="remove-trigger btn--secondary" onClick={() => onRemoveTrigger(index)}>
				Remove Trigger
			</Button>
		);
	}

	rendersData() {
		const { triggers } = this.props;

		return triggers.map((trigger, index) => {
			const { key, valueError, operatorError, keyError } = trigger;

			return (
				<div
					className={`trigger ${valueError || operatorError || keyError ? `error` : ``}`}
					key={`trigger-${key}-${index}`}
				>
					<div className="col-1">
						{index === 0 ? this.getTextNode('IF') : this.getTextNode('AND')}
					</div>

					<div className="col-2 content">
						{this.renderKeyDropdown(index, trigger)}
						{this.renderOperatorDropdown(index, trigger)}
						{this.renderValueDropdown(index, trigger)}
					</div>

					{this.renderRemoveTriggerButton(index)}
				</div>
			);
		});
	}

	render() {
		return (
			<div className="triggers-container">
				<h3 className="container-heading">Triggers</h3>
				{this.rendersData()}
				{this.renderAddTriggerButton()}
			</div>
		);
	}
}

export default HeaderBiddingRuleTriggers;
