import React from 'react';
import Select from 'react-select';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, FormControl } from '@/Client/helpers/react-bootstrap-imports';

import DragDropCard from './DragDropCard';
import CustomToggleSwitch from '../../../Components/CustomToggleSwitch';

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

// const getDropdownOptions = key => {
// 	switch (key) {
// 		case 'action-key':
// 			return [
// 				{
// 					label: 'Allow Bidders',
// 					value: 'allowed_bidders'
// 				},
// 				{
// 					label: 'Order of bidders',
// 					value: 'bidders_order'
// 				},
// 				{
// 					label: 'Most Significant Bidders',
// 					value: 'significant_bidders'
// 				},
// 				{
// 					label: 'Set Refresh Timeout',
// 					value: 'refresh_timeout'
// 				},
// 				{
// 					label: 'Set Initial Timeout',
// 					value: 'initial_timeout'
// 				},
// 				{
// 					label: 'Disable S2S',
// 					value: 's2s_toggle'
// 				},
// 				{
// 					label: 'Set S2S Timeout',
// 					value: 's2s_timeout'
// 				},
// 				{
// 					label: 'Use formats',
// 					value: 'formats'
// 				}
// 			];

// 		default:
// 			return [];
// 	}
// };

class HeaderBiddingRuleActions extends React.Component {
	// -------------------------- misc --------------------------

	// common
	getTextNode = text => <span className="text">{text}</span>;

	getActionTemplate = () => ({
		key: null,
		value: [],
		typeError: null,
		valueError: null
	});

	// getPreparedActionKeyOptions(index) {
	// 	const { actions, dropdownOptions } = this.props;

	// 	const { key: keyOptions } = dropdownOptions;
	// 	// for disabled option, disable it if it is not the chosen value of current action

	// 	const currentValue = actions[index].key;
	// 	// const disableOptions = keyOptions.map(option => )

	// 	const actionOptions = getDropdownOptions('action-key');
	// 	const chosenActions = actions.map(action => action.key);

	// 	// disable the options that are already selected
	// 	return actionOptions.map(option => ({
	// 		...option,
	// 		isDisabled: chosenActions.includes(option.value) && option.value !== currentValue
	// 	}));
	// }

	// getDropdownValuesByKey(type) {
	// 	switch (type) {
	// 		case 'formats':
	// 			return [
	// 				{ label: 'Banner', value: 'banner', isFixed: true },
	// 				{ label: 'Native', value: 'native' },
	// 				{ label: 'Video', value: 'video' }
	// 			];

	// 		case 'allowed_bidders':
	// 		case 'significant_bidders':
	// 			const { addedBidders } = this.props;

	// 			return Object.values(addedBidders).map(bidder => ({
	// 				label: bidder.name,
	// 				value: bidder.name
	// 			}));

	// 		default:
	// 			return [];
	// 	}
	// }

	// getResetValueForAction(actionKey) {
	// 	const booleanTypes = ['s2s_toggle'];
	// 	const numberTypes = ['refresh_timeout', 'initial_timeout', 's2s_timeout'];
	// 	const arrayTypes = ['allowed_bidders', 'bidders_order', 'significant_bidders'];

	// 	if (booleanTypes.includes(actionKey)) return false;
	// 	if (numberTypes.includes(actionKey)) return 0;
	// 	if (arrayTypes.includes(actionKey)) return [];
	// 	if (actionKey === 'formats') return ['banner']; // fixed/mandatory option

	// 	return null;
	// }

	// -------------------------- handlers --------------------------

	// handleKeyChange = (index, { value }) => {
	// 	const { actions, onChange, addedBidders } = this.props;
	// 	const newActions = [...actions];

	// 	const action = newActions[index];
	// 	action.key = value;
	// 	action.value = this.getResetValueForAction(value);
	// 	action.typeError = null;
	// 	action.valueError = null;

	// 	if (value === 'bidders_order') {
	// 		const addedBiddersData = Object.values(addedBidders).map(({ name }) => name);
	// 		action.value = addedBiddersData;
	// 	}

	// 	onChange(newActions);
	// };

	handleValueChange = (index, valueType, selection) => {
		const { actions, onChange } = this.props;

		let value = null;

		let error = null;

		switch (valueType) {
			case 'dropdown':
				value = Array.isArray(selection) ? selection.map(({ value }) => value) : selection.value;
				error = value.length === 0 ? 'Please select an option' : null;
				break;

			case 'number':
				selection.persist();

				const selectedValue = selection.target.value;
				const parsedNumber = parseInt(selectedValue, 10);
				value = Number.isNaN(parsedNumber) ? 0 : parsedNumber;
				if (!(value >= 0 && value <= 10000)) {
					error = 'Please choose a number between 0 and 10000';
				}

				break;

			case 'radio':
				value = typeof selection === 'boolean' ? selection : false;
				break;

			default:
				break;
		}

		const newActions = [...actions];
		newActions[index].value = value;
		newActions[index].valueError = error;

		onChange(newActions);
	};

	handleAddAction() {
		const { actions, onChange } = this.props;
		const newActions = [...actions, this.getActionTemplate()];

		onChange(newActions);
	}

	// handleRemoveAction(index) {
	// 	const { actions, onChange } = this.props;

	// 	const { key } = actions[index];
	// 	// const confirmed = confirm(`Remove Action : ${key || ''}?`);
	// 	const confirmed = confirm(`Remove Action ?`);

	// 	if (!confirmed) {
	// 		return false;
	// 	}

	// 	const newActions = [...actions.slice(0, index), ...actions.slice(index + 1)];

	// 	onChange(newActions);
	// }

	handleDraggedCard(dragIndex, hoverIndex, index) {
		const { actions, onChange } = this.props;

		const newActions = [...actions];
		const orderedBidders = newActions[index].value;
		const draggedBidder = orderedBidders[dragIndex];

		// remove dragged bidder from its original position
		orderedBidders.splice(dragIndex, 1);
		// place it at the position it was hovered at
		orderedBidders.splice(hoverIndex, 0, draggedBidder);

		onChange(newActions);
	}

	// -------------------------- rendering --------------------------

	renderAddActionButton() {
		const { actions, dropdownOptions, onAddAction } = this.props;

		const { keyOptions } = dropdownOptions;
		const supportedOptions = keyOptions.filter(option => !option.isNotSupported);
		const consumedAllSupportedOptions = actions.length >= supportedOptions.length;

		return (
			<Button
				className="add-action"
				onClick={onAddAction}
				disabled={consumedAllSupportedOptions}
				title={consumedAllSupportedOptions ? 'You have added all the available Actions' : ''}
			>
				Add Action
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
				{error && <p className="error-message">{error}</p>}
			</div>
		);
	}

	renderRemoveActionButton(index) {
		const { onRemoveAction } = this.props;
		return (
			<Button className="remove-action btn--secondary" onClick={() => onRemoveAction(index)}>
				Remove Action
			</Button>
		);
	}

	// renderValueElement(valueType, index, onChangeHandler, currentValue, error) {
	renderValueElement(index, action, onChangeHandler, isIgnored) {
		const { dropdownOptions } = this.props;
		const { valueOptions } = dropdownOptions;

		const { key: elementType, value: currentValue, valueError: error } = action;

		const radioElementTypes = ['s2s_toggle'];
		const numberElementTypes = ['initial_timeout', 'refresh_timeout', 's2s_timeout'];
		const dropdownElementTypes = ['formats', 'allowed_bidders', 'significant_bidders'];

		if (dropdownElementTypes.includes(elementType)) {
			const validCurrentValue = Array.isArray(currentValue) ? currentValue : [];

			const options = valueOptions[elementType] || [];
			const selectedOption = options.filter(option => validCurrentValue.includes(option.value));

			const styles = getDropdownStyles(error);

			return (
				<div className="dropdown value-dropdown dropdown--full-width">
					<Select
						isDisabled={isIgnored}
						styles={styles}
						menuPlacement="auto"
						options={options}
						isMulti
						value={selectedOption}
						isClearable={!selectedOption.some(option => option.isFixed)}
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
						placeholder="(in ms)"
					/>

					<p className="label">(in Milliseconds) Min: 0ms | Max: 10000ms</p>
					{error && <p className="error-message">{error}</p>}
				</div>
			);
		}

		if (radioElementTypes.includes(elementType)) {
			return (
				<div className="toggle">
					<CustomToggleSwitch
						defaultLayout
						checked={currentValue}
						onChange={e => onChangeHandler(index, 'radio', e)}
						name="disableS2s"
						layout="nolabel"
						size="m"
						id="disableS2s"
						on="Enable"
						off="Disable"
					/>
				</div>
			);
		}

		if (elementType === 'bidders_order') {
			const { onBiddersOrderChange } = this.props;

			const renderBidder = (name, bidderIndex) => (
				<DragDropCard
					key={name}
					index={bidderIndex}
					id={name}
					text={name}
					moveCard={(dragIndex, hoverIndex) => onBiddersOrderChange(dragIndex, hoverIndex, index)}
				/>
			);

			const { actions } = this.props;

			return (
				<>
					<div className="drag-drop">
						{actions[index].value.length && (
							<p className="message top">
								Please <i>drag and drop</i> the cards to change the order
							</p>
						)}
						{actions[index].value.map((bidder, i) => renderBidder(bidder, i))}
						{actions[index].value.length && (
							<p className="message bottom">
								If you are using Allow Bidders action, only the bidders selected in Allow Bidders
								will be used
							</p>
						)}
						{/* show # before index and align them to left */}
					</div>
				</>
			);
		}

		return null;
	}

	renderActionsData() {
		const { actions, onKeyChange, onValueChange } = this.props;

		return actions.map((action, index) => {
			const { key, isIgnored = false, isIgnoredMessage, typeError, valueError } = action;

			return (
				<div
					className={`action ${typeError || valueError ? 'error' : ''} ${
						isIgnored ? `ignored` : ``
					}`}
					key={`action-${key}-${index}`}
				>
					<DndProvider backend={HTML5Backend}>
						<div className="col-1">{this.getTextNode(`Action - ${index + 1}`)}</div>
						<div className="col-2 content">
							{/* pass complete action to them */}
							{this.renderKeyDropdown(index, action, onKeyChange, isIgnored)}
							{this.renderValueElement(index, action, onValueChange, isIgnored)}
							{/* {error && <p className="error-message">{error}</p>} */}
						</div>

						{this.renderRemoveActionButton(index)}
					</DndProvider>
					{isIgnored && <p className="ignored-message">{isIgnoredMessage}</p>}
				</div>
			);
		});
	}

	render() {
		return (
			<div className="actions-container">
				<h3 className="container-heading">Actions</h3>
				{this.renderActionsData()}
				{this.renderAddActionButton()}
			</div>
		);
	}
}

export default HeaderBiddingRuleActions;
