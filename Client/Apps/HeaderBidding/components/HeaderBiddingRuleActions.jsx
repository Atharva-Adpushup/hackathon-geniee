import React from 'react';
import Select from 'react-select';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, FormControl } from '@/Client/helpers/react-bootstrap-imports';

import DragDropCard from './DragDropCard';
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

class HeaderBiddingRuleActions extends React.Component {
	// common
	getTextNode = text => <span className="text">{text}</span>;

	getActionTemplate = () => ({
		key: null,
		value: [],
		typeError: null,
		valueError: null
	});

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

		const radioElementTypes = ['s2s_toggle', 'disable_header_bidding'];
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
			// nothing to be rendered

			return null;
		}

		if (elementType === 'bidders_order') {
			const { actions, onBiddersOrderChange } = this.props;

			const renderBidder = ({ label, value }, bidderIndex) => (
				<DragDropCard
					key={value}
					index={bidderIndex}
					id={value}
					text={label}
					value={value}
					moveCard={(dragIndex, hoverIndex) => onBiddersOrderChange(dragIndex, hoverIndex, index)}
				/>
			);

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
								If you are using Allow Bidders Action, only the Bidders selected in Allow Bidders
								will be used
							</p>
						)}
						{/* TODO: show # before index and align them to left */}
					</div>
				</>
			);
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

export default HeaderBiddingRuleActions;
