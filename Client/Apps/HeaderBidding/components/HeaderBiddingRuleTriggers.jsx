import React from 'react';
import Select from 'react-select';
import { Button } from '@/Client/helpers/react-bootstrap-imports';

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
					<>
						<Select
							isMulti
							styles={styles}
							options={options}
							value={selectedOption}
							onChange={e => onChangeHandler(index, e)}
						/>
						{error && <p className="error-message">{error}</p>}
					</>
				)}
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
				className="add-trigger btn-primary"
				onClick={onAddTrigger}
				disabled={consumedAllSupportedOptions}
				title={consumedAllSupportedOptions ? 'You have added all the available Triggers' : ''}
			>
				Add New Trigger
			</Button>
		);
	}

	renderRemoveTriggerButton(index) {
		const { onRemoveTrigger } = this.props;

		return (
			<Button className="remove-trigger btn--secondary" onClick={() => onRemoveTrigger(index)}>
				Delete
			</Button>
		);
	}

	renderData() {
		const { triggers } = this.props;

		return triggers.length === 0 ? (
			<div className="empty-state">
				No triggers added! Press the Add Trigger button to start adding triggers
			</div>
		) : (
			triggers.map((trigger, index) => {
				const { key, valueError, operatorError, keyError } = trigger;

				return (
					<div
						className={`trigger container-body ${
							valueError || operatorError || keyError ? `error` : ``
						}`}
						// eslint-disable-next-line react/no-array-index-key
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
			})
		);
	}

	render() {
		return (
			<div className="triggers-container u-margin-b4">
				<div className="container-header">
					<h3 className="container-title">Triggers</h3>
				</div>
				{this.renderData()}
				<div className="container-footer">{this.renderAddTriggerButton()}</div>
			</div>
		);
	}
}

export default HeaderBiddingRuleTriggers;
