import React from 'react';
import _omitBy from 'lodash/omitBy';
import { Button } from '@/Client/helpers/react-bootstrap-imports';

import history from '../../../helpers/history';
import axiosInstance from '../../../helpers/axiosInstance';
import HeaderBiddingRuleActions from './HeaderBiddingRuleActions';
import HeaderBiddingRuleTriggers from './HeaderBiddingRuleTriggers';
import CustomToggleSwitch from '../../../Components/CustomToggleSwitch';

const getConvertedBiddersData = bidders => {
	const { addedBidders } = bidders;

	return Object.values(addedBidders).map(({ name }) => ({
		label: name,
		value: name
	}));
};

const getConvertedAdUnitsData = adUnits =>
	adUnits.map(({ adUnit }) => ({ label: adUnit, value: adUnit }));

class HeaderBiddingRules extends React.Component {
	notSupportedOptions = [
		'triggerKeyOptions.country',
		'actionKeyOptions.s2s_toggle',
		'actionKeyOptions.s2s_timeout',
		'actionKeyOptions.significant_bidders'
	];

	constructor(props) {
		super(props);
		const { bidders, inventories } = props;

		const adUnits = getConvertedAdUnitsData(inventories);
		const allowedBidders = getConvertedBiddersData(bidders);

		this.state = {
			isActive: true,
			triggers: [],
			actions: [],
			actionKeyOptions: [
				{
					label: 'Allow Bidders',
					value: 'allowed_bidders'
				},
				{
					label: 'Order of bidders',
					value: 'bidders_order'
				},

				{
					label: 'Set Refresh Timeout',
					value: 'refresh_timeout'
				},
				{
					label: 'Set Initial Timeout',
					value: 'initial_timeout'
				},
				{
					label: 'Use formats',
					value: 'formats'
				},
				{
					label: 'Disable Header Bidding',
					value: 'disable_header_bidding'
				},
				{
					label: 'Disable S2S',
					value: 's2s_toggle'
				},
				{
					label: 'Set S2S Timeout',
					value: 's2s_timeout'
				},
				{
					label: 'Most Significant Bidders',
					value: 'significant_bidders'
				}
			],
			actionValueOptions: {
				allowed_bidders: allowedBidders,
				formats: []
			},
			triggerKeyOptions: [
				{
					label: 'Country',
					value: 'country'
				},
				{
					label: 'Device',
					value: 'device'
				},
				{
					label: 'Time Range',
					value: 'time_range'
				},
				{
					label: 'Ad Unit',
					value: 'adunit'
				},
				{
					label: 'Day of the Week',
					value: 'day_of_the_week'
				}
			],
			triggerOperatorOptions: [
				{
					label: 'IS IN',
					value: 'contain'
				},
				{
					label: 'IS NOT IN',
					value: 'not_contain'
				}
			],
			triggerValueOptions: {
				country: [],
				device: [],
				time_range: [],
				day_of_the_week: [],
				adunit: adUnits
			},
			actionKeyIndexMap: {},
			triggerKeyIndexMap: {},

			// required for getDerivedStateFromProps
			bidders,
			inventories
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleRuleStatusChange = this.handleRuleStatusChange.bind(this);

		this.handleAddTrigger = this.handleAddTrigger.bind(this);
		this.handleRemoveTrigger = this.handleRemoveTrigger.bind(this);
		this.handleTriggerKeyChange = this.handleTriggerKeyChange.bind(this);
		this.handleTriggerOperatorChange = this.handleTriggerOperatorChange.bind(this);
		this.handleTriggerValueChange = this.handleTriggerValueChange.bind(this);

		this.handleAddAction = this.handleAddAction.bind(this);
		this.handleRemoveAction = this.handleRemoveAction.bind(this);
		this.handleActionKeyChange = this.handleActionKeyChange.bind(this);
		this.handleActionValueChange = this.handleActionValueChange.bind(this);
		this.handleBiddersOrderChange = this.handleBiddersOrderChange.bind(this);
	}

	static getDerivedStateFromProps(props, state) {
		const { bidders: newBidders, inventories: newInventories } = props;
		const { bidders: currentBidders, inventories: currentInventories } = state;

		let updatedState = {};

		if (newBidders !== currentBidders) {
			updatedState = {
				actionValueOptions: {
					...state.actionValueOptions,
					allowed_bidders: getConvertedBiddersData(newBidders)
				}
			};
		}

		if (newInventories !== currentInventories) {
			updatedState = {
				...updatedState,
				triggerValueOptions: {
					...state.triggerValueOptions,
					adunit: getConvertedAdUnitsData(newInventories)
				}
			};
		}

		return Object.keys(updatedState).length ? updatedState : null;
	}

	componentDidMount() {
		this.getMetaData();
	}

	getMetaData() {
		axiosInstance
			.get('headerBidding/rules/meta')
			.then(({ data }) => {
				const { countries, devices, days, timeSlots, adTypes } = data;
				this.setState(state => ({
					actionValueOptions: {
						...state.actionValueOptions,
						// display is mandatory
						formats: adTypes.map(item => ({ ...item, isFixed: item.value === 'display' }))
					},
					triggerValueOptions: {
						...state.triggerValueOptions,
						country: countries,
						device: devices,
						time_range: timeSlots,
						day_of_the_week: days
					}
				}));
			})
			.catch(error => {
				console.error(error.message);
				history.push('/error');
			});
	}

	getTemplate(type) {
		const template = {
			key: null,
			value: [],
			keyError: null,
			valueError: null
		};

		if (type === 'trigger') {
			template.operator = null;
			template.operatorError = null;
		}

		return template;
	}

	// ------------------------------ action ----------------------------

	handleAddAction() {
		this.setState(state => ({
			...state,
			actions: [...state.actions, this.getTemplate('action')]
		}));
	}

	handleRemoveAction(index) {
		const confirmed = confirm('Are you sure you want to remove this action?');

		if (!confirmed) return false;

		const stateHandler = state => ({
			...state,
			actions: [...state.actions.slice(0, index), ...state.actions.slice(index + 1)]
		});

		this.setState(stateHandler, this.updateActionKeyIndexMap);
	}

	updateActionKeyIndexMap() {
		const { actions, actionKeyOptions, actionKeyIndexMap } = this.state;
		const updatedActionKeyIndexMap = { ...actionKeyIndexMap };

		for (const option of actionKeyOptions) {
			const actionIndex = actions.findIndex(action => action.key === option.value);

			if (actionIndex === -1) {
				delete updatedActionKeyIndexMap[option.value];
			} else {
				updatedActionKeyIndexMap[option.value] = actionIndex;
			}
		}

		this.setState({ actionKeyIndexMap: updatedActionKeyIndexMap });
	}

	getDropdownOptionsForAction() {
		const { actionKeyOptions, actionValueOptions, actionKeyIndexMap } = this.state;

		// sort options list
		const enabledOptions = [];
		const disabledOptions = [];
		const notSupportedOptions = [];

		actionKeyOptions.forEach(option => {
			const isNotSupported = this.notSupportedOptions.includes(`actionKeyOptions.${option.value}`);
			const selectedFor = actionKeyIndexMap[option.value];

			const item = {
				...option,
				isDisabled: isNotSupported,
				isNotSupported,
				selectedFor,
				label: `${option.label}${isNotSupported ? ` (Not Supported)` : ``}`
			};

			isNotSupported
				? notSupportedOptions.push(item)
				: typeof selectedFor !== 'undefined'
				? disabledOptions.push(item)
				: enabledOptions.push(item);
		});

		const filteredActionKeyOptions = [
			...enabledOptions,
			...disabledOptions,
			...notSupportedOptions
		];

		return {
			keyOptions: filteredActionKeyOptions,
			valueOptions: actionValueOptions
		};
	}

	getResetValueForAction(actionKey) {
		const booleanTypes = ['s2s_toggle'];
		const numberTypes = ['refresh_timeout', 'initial_timeout', 's2s_timeout'];
		const arrayTypes = ['allowed_bidders', 'bidders_order', 'significant_bidders'];

		if (booleanTypes.includes(actionKey)) return false;
		if (numberTypes.includes(actionKey)) return 0;
		if (arrayTypes.includes(actionKey)) return [];
		if (actionKey === 'formats') return ['banner']; // fixed/mandatory option

		return null;
	}

	handleActionKeyChange(index, { value, isIgnored, isIgnoredMessage }) {
		this.setState(state => {
			const { actions, actionKeyIndexMap } = state;
			const newActions = [...actions];

			const action = {
				...newActions[index],
				key: value,
				value: this.getResetValueForAction(value),
				keyError: null,
				valueError: null,
				isIgnored: !!isIgnored,
				isIgnoredMessage: isIgnored ? isIgnoredMessage : null
			};

			if (value === 'bidders_order') {
				const { bidders } = this.props;
				const { addedBidders } = bidders;
				const addedBiddersData = Object.values(addedBidders).map(({ name }) => name);

				action.value = addedBiddersData;
			}

			if (value === 'formats') {
				// display is mandatory
				action.value = ['display'];
			}

			if (value === 'disable_header_bidding') {
				action.value = true;
			}

			newActions[index] = action;

			// remove index for last value if any
			const updatedActionKeyIndexMap = _omitBy(actionKeyIndexMap, val => val === index);

			return {
				...state,
				actions: newActions,
				actionKeyIndexMap: { ...updatedActionKeyIndexMap, [value]: index }
			};
		});
	}

	handleActionValueChange(index, valueType, selection) {
		const { actions } = this.state;

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

		this.setState(state => ({ ...state, actions: newActions }));
	}

	handleBiddersOrderChange(dragIndex, hoverIndex, index) {
		const { actions } = this.state;

		const newActions = [...actions];
		const orderedBidders = newActions[index].value;
		const draggedBidder = orderedBidders[dragIndex];

		// remove dragged bidder from its original position
		orderedBidders.splice(dragIndex, 1);
		// place it at the position it was hovered at
		orderedBidders.splice(hoverIndex, 0, draggedBidder);

		this.setState({
			actions: newActions
		});
	}

	// ------------------------------ trigger ----------------------------

	handleAddTrigger() {
		this.setState(state => ({
			...state,
			triggers: [...state.triggers, this.getTemplate('trigger')]
		}));
	}

	handleRemoveTrigger(index) {
		const confirmed = confirm('Are you sure you want to remove this trigger?');

		if (!confirmed) return false;

		const stateHandler = state => ({
			...state,
			triggers: [...state.triggers.slice(0, index), ...state.triggers.slice(index + 1)]
		});

		const afterStateUpdate = () => {
			this.updateTriggerKeyIndexMap();
			this.updateIgnoredFields();
		};

		this.setState(stateHandler, afterStateUpdate);
	}

	updateTriggerKeyIndexMap() {
		const { triggers, triggerKeyOptions, triggerKeyIndexMap } = this.state;
		const updatedTriggerKeyIndexMap = { ...triggerKeyIndexMap };

		for (const option of triggerKeyOptions) {
			const triggerIndex = triggers.findIndex(trigger => trigger.key === option.value);

			if (triggerIndex === -1) {
				delete updatedTriggerKeyIndexMap[option.value];
			} else {
				updatedTriggerKeyIndexMap[option.value] = triggerIndex;
			}
		}

		this.setState({ triggerKeyIndexMap: updatedTriggerKeyIndexMap });
	}

	getDropdownOptionsForTrigger() {
		const {
			triggerKeyOptions,
			triggerOperatorOptions,
			triggerValueOptions,
			triggerKeyIndexMap
		} = this.state;

		// sort options list
		const enabledOptions = [];
		const disabledOptions = [];
		const notSupportedOptions = [];

		triggerKeyOptions.forEach(option => {
			const isNotSupported = this.notSupportedOptions.includes(`triggerKeyOptions.${option.value}`);
			const selectedFor = triggerKeyIndexMap[option.value];

			const item = {
				...option,
				isDisabled: isNotSupported,
				isNotSupported,
				selectedFor,
				label: `${option.label}${isNotSupported ? ` (Not Supported)` : ``}`
			};

			isNotSupported
				? notSupportedOptions.push(item)
				: typeof selectedFor !== 'undefined'
				? disabledOptions.push(item)
				: enabledOptions.push(item);
		});

		const filteredTriggerKeyOptions = [
			...enabledOptions,
			...disabledOptions,
			...notSupportedOptions
		];

		return {
			valueOptions: triggerValueOptions,
			keyOptions: filteredTriggerKeyOptions,
			operatorOptions: triggerOperatorOptions
		};
	}

	updateIgnoredFields() {
		const { triggers, actions, actionKeyOptions } = this.state;

		const adUnitTriggerIndex = triggers.findIndex(trigger => trigger.key === 'adunit');

		const ignoreHbTimeouts = adUnitTriggerIndex !== -1;
		const optionsToBeIgnored = ['initial_timeout', 'refresh_timeout'];

		const newActionKeyOptions = actionKeyOptions.map(option => {
			if (optionsToBeIgnored.includes(option.value)) {
				// add ignored data to option which will be used when this option is selected
				option.isIgnored = ignoreHbTimeouts;
				option.isIgnoredMessage = ignoreHbTimeouts
					? `You cannot set this value if Ad Unit Trigger is set`
					: null;
			}

			return option;
		});

		// add ignored data to action that has these options selected
		const newActions = actions.map(action => {
			if (optionsToBeIgnored.includes(action.key)) {
				action.isIgnored = ignoreHbTimeouts;
				action.isIgnoredMessage = ignoreHbTimeouts
					? `You cannot set this value if Ad Unit Trigger is set`
					: null;
			}

			return action;
		});

		this.setState({
			actions: newActions,
			actionKeyOptions: newActionKeyOptions
		});
	}

	handleTriggerKeyChange(index, { value }) {
		const stateHandler = state => {
			const { triggers, triggerKeyIndexMap } = state;
			const newTriggers = [...triggers];

			const trigger = {
				...newTriggers[index],
				key: value,
				value: [],
				keyError: null,
				valueError: null
			};

			newTriggers[index] = trigger;

			// remove index for last value if any
			const updatedTriggerKeyIndexMap = _omitBy(triggerKeyIndexMap, val => val === index);

			return {
				...state,
				triggers: newTriggers,
				triggerKeyIndexMap: { ...updatedTriggerKeyIndexMap, [value]: index }
			};
		};

		this.setState(stateHandler, this.updateIgnoredFields);
	}

	handleTriggerOperatorChange(index, { value }) {
		const { triggers } = this.state;

		const newTriggers = [...triggers];
		newTriggers[index].operator = value;
		newTriggers[index].operatorError = null;

		// reset value dropdown
		newTriggers[index].value = [];
		newTriggers[index].valueError = null;

		this.setState({
			triggers: newTriggers
		});
	}

	handleTriggerValueChange(index, value) {
		const { triggers } = this.state;

		const newTriggers = [...triggers];

		const preparedValue = Array.isArray(value) ? value.map(({ value }) => value) : [];

		newTriggers[index].value = preparedValue;
		newTriggers[index].valueError = preparedValue.length === 0 ? 'Please select an option' : null;

		this.setState(state => ({ ...state, triggers: newTriggers }));
	}

	handleSubmit() {
		const { showNotification } = this.props;

		const { triggers, actions } = this.state;
		let hasInvalidTriggers = false;
		let hasInvalidActions = false;
		let hasMinimumOneValidTrigger = false;
		let hasMinimumOneValidAction = false;

		const updatedTriggers = [];
		const updatedActions = [];

		for (let index = 0; index < triggers.length; index++) {
			const trigger = triggers[index];

			const hasInvalidKey = !trigger.key;
			const hasInvalidOperator = !trigger.operator;
			const hasInvalidValue =
				trigger.value === null || (Array.isArray(trigger.value) && trigger.value.length === 0);

			if (hasInvalidKey || hasInvalidOperator || hasInvalidValue) {
				hasInvalidTriggers = true;
			}

			if (!trigger.isIgnored) {
				hasMinimumOneValidTrigger = true;
			}

			trigger.keyError = trigger.keyError || hasInvalidKey ? 'Please select an option' : '';
			trigger.operatorError =
				trigger.operatorError || hasInvalidOperator ? 'Please select an option' : '';
			trigger.valueError = trigger.valueError || hasInvalidValue ? 'Please select an option' : '';

			updatedTriggers.push(trigger);
		}

		for (let index = 0; index < actions.length; index++) {
			const action = actions[index];

			const hasInvalidKey = !action.key;
			const hasInvalidValue =
				action.value === null || (Array.isArray(action.value) && action.value.length === 0);

			if (hasInvalidKey || hasInvalidValue) {
				hasInvalidActions = true;
			}

			if (!action.isIgnored) {
				hasMinimumOneValidAction = true;
			}

			action.keyError = action.keyError || hasInvalidKey ? 'Please select an option' : '';
			action.valueError = action.valueError || hasInvalidValue ? 'Please select an option' : '';

			updatedActions.push(action);
		}

		if (!hasMinimumOneValidAction || !hasMinimumOneValidTrigger) {
			let message = '';

			if (!hasMinimumOneValidAction) {
				message = 'Please add atleast one valid Action';
			}

			if (!hasMinimumOneValidTrigger) {
				message = message.length
					? `${message} and one valid Trigger`
					: 'Please add atleast one valid Trigger';
			}

			const notification = {
				message,
				title: 'Invalid Data',
				mode: 'error',
				autoDismiss: 5
			};

			showNotification(notification);
		}

		if (hasInvalidActions || hasInvalidTriggers) {
			const updatedState = {};

			hasInvalidActions && (updatedState['actions'] = updatedActions);
			hasInvalidTriggers && (updatedState['triggers'] = updatedTriggers);

			return this.setState(updatedState);
		}
	}

	handleRuleStatusChange(status) {
		this.setState({
			isActive: status
		});
	}

	renderContent() {
		const { actions, triggers, isActive } = this.state;

		const actionDropdownOptions = this.getDropdownOptionsForAction();
		const triggerDropdownOptions = this.getDropdownOptionsForTrigger();

		return (
			<div className="page__content">
				Rule Status
				<CustomToggleSwitch
					defaultLayout
					checked={isActive}
					onChange={this.handleRuleStatusChange}
					name="isActive"
					layout="nolabel"
					size="m"
					id="isActive"
					on="Enable"
					off="Disable"
				/>
				<HeaderBiddingRuleTriggers
					triggers={triggers}
					onAddTrigger={this.handleAddTrigger}
					onRemoveTrigger={this.handleRemoveTrigger}
					dropdownOptions={triggerDropdownOptions}
					onKeyChange={this.handleTriggerKeyChange}
					onValueChange={this.handleTriggerValueChange}
					onOperatorChange={this.handleTriggerOperatorChange}
				/>
				<HeaderBiddingRuleActions
					actions={actions}
					onAddAction={this.handleAddAction}
					onRemoveAction={this.handleRemoveAction}
					onKeyChange={this.handleActionKeyChange}
					onValueChange={this.handleActionValueChange}
					onBiddersOrderChange={this.handleBiddersOrderChange}
					dropdownOptions={actionDropdownOptions}
				/>
				<div className="control">
					<Button className="btn-primary" onClick={this.handleSubmit}>
						Save
					</Button>
				</div>
			</div>
		);
	}

	render() {
		return (
			<div className="hb-rules">
				<h3 className="page__title">HB Rules</h3>
				<h5 className="page__subtitle">
					Please follow the below steps to add different Rules for Header Bidding
				</h5>
				{this.renderContent()}
			</div>
		);
	}
}

export default HeaderBiddingRules;
