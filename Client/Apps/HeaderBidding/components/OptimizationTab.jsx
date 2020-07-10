import React from 'react';
import _omitBy from 'lodash/omitBy';
import _cloneDeep from 'lodash/cloneDeep';

import { Button } from '@/Client/helpers/react-bootstrap-imports';

import history from '../../../helpers/history';
import utils from '../../../helpers/utils';
import axiosInstance from '../../../helpers/axiosInstance';
import HeaderBiddingRuleActions from './HeaderBiddingRuleActions';
import HeaderBiddingRuleTriggers from './HeaderBiddingRuleTriggers';
import CustomToggleSwitch from '../../../Components/CustomToggleSwitch';
import Loader from '../../../Components/Loader';
import HeaderBiddingRulesList from './HeaderBiddingRulesList';

const getConvertedBiddersData = bidders => {
	const { addedBidders } = bidders;

	return Object.keys(addedBidders).map(bidderCode => {
		const { name } = addedBidders[bidderCode];
		return {
			label: name,
			value: bidderCode
		};
	});
};

const getConvertedAdUnitsData = adUnits => {
	return adUnits.map(item => {
		let labelKey = 'adUnit';
		let valueKey = 'adUnitId';

		if (item.type === 'apLite') {
			labelKey = 'adUnit';
			valueKey = 'sectionId';
		}

		return { label: item[labelKey], value: item[valueKey] };
	});
};

class OptimizationTab extends React.Component {
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
			showLoader: true,
			selectedRuleIndex: null,
			activeComponent: 'list-component',
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
		this.goBackToList = this.goBackToList.bind(this);
		this.handleEditRule = this.handleEditRule.bind(this);
		this.handleToggleStatus = this.handleToggleStatus.bind(this);
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
		const { siteId, fetchHBRulesAction } = this.props;
		fetchHBRulesAction(siteId);
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
			})
			.then(() => {
				this.setState({
					showLoader: false
				});
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

	// ------------------------------ global ------------------------

	validateBeforeSubmit() {
		const { showNotification } = this.props;
		const { triggers, actions } = this.state;

		let hasInvalidData = false;
		let hasInvalidTriggers = triggers.length === 0;
		let hasInvalidActions = actions.length === 0;

		let hasMinimumOneValidTrigger = false;
		let hasMinimumOneValidAction = false;
		let hasIgnoredTrigger = false;
		let hasIgnoredAction = false;

		const updatedTriggers = [];
		const updatedActions = [];

		// set error for key, operator, value of trigger if not valid
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
			} else {
				hasIgnoredTrigger = true;
			}

			trigger.keyError = trigger.keyError || hasInvalidKey ? 'Please select an option' : '';
			trigger.operatorError =
				trigger.operatorError || hasInvalidOperator ? 'Please select an option' : '';
			trigger.valueError = trigger.valueError || hasInvalidValue ? 'Please select an option' : '';

			updatedTriggers.push(trigger);
		}

		// set error for key, value of action if not valid
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
			} else {
				hasIgnoredAction = true;
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
			hasInvalidData = true;
		}

		if (hasIgnoredAction || hasIgnoredTrigger) {
			const notification = {
				message: 'Please remove the fields that can not be set',
				title: 'Invalid Data',
				mode: 'error',
				autoDismiss: 5
			};

			showNotification(notification);
			hasInvalidData = true;
		}

		if (hasInvalidActions || hasInvalidTriggers) {
			const updatedState = {};

			hasInvalidActions && (updatedState.actions = updatedActions);
			hasInvalidTriggers && (updatedState.triggers = updatedTriggers);

			this.setState(updatedState);

			hasInvalidData = true;
		}

		return hasInvalidData;
	}

	handleSubmit() {
		const { siteId, showNotification, saveHBRulesAction, setUnsavedChangesAction } = this.props;
		const { triggers, actions, isActive, selectedRuleIndex } = this.state;

		const hasInvalidData = this.validateBeforeSubmit();

		if (hasInvalidData) {
			return false;
		}

		const triggersData = triggers.reduce((data, trigger) => {
			if (!trigger.isIgnored) {
				const value =
					trigger.key === 'day_of_the_week'
						? trigger.value.reduce((output, val) => {
								output = output.concat(val.split(','));
								return output;
						  }, [])
						: trigger.value;

				data.push({
					key: trigger.key,
					operator: trigger.operator,
					value
				});
			}
			return data;
		}, []);

		const actionsData = actions.reduce((data, action) => {
			if (!action.isIgnored) {
				data.push({
					key: action.key,
					operator: action.operator,
					value: action.value
				});
			}
			return data;
		}, []);

		// save the rule
		const rule = {
			isActive,
			actions: actionsData,
			triggers: triggersData
		};

		saveHBRulesAction(siteId, { rule, ruleIndex: selectedRuleIndex })
			.then(() => {
				const notification = {
					mode: 'success',
					title: 'Operation Successful',
					message: `Rule ${utils.isNumber(selectedRuleIndex) ? 'updated' : 'added'} successfully`,
					autoDismiss: 5
				};

				setUnsavedChangesAction(true);
				showNotification(notification);
				this.goBackToList(false);
			})
			.catch(error => {
				console.error(error);

				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: error.message,
					autoDismiss: 5
				});
			});
	}

	goBackToList(getConfirmation = true) {
		const confirmed =
			getConfirmation && window.confirm('Are you sure? Any unsaved changes made will be lost!');

		if (getConfirmation && !confirmed) return;

		this.setState({
			selectedRuleIndex: null,
			activeComponent: 'list-component',
			triggers: [],
			actions: []
		});
	}

	handleRuleStatusChange(status) {
		this.setState({
			isActive: status
		});
	}

	handleActiveComponent(activeComponent) {
		this.setState({ activeComponent });
	}

	renderRuleComponent() {
		const { actions, triggers, isActive, selectedRuleIndex } = this.state;

		const actionDropdownOptions = this.getDropdownOptionsForAction();
		const triggerDropdownOptions = this.getDropdownOptionsForTrigger();

		return (
			<>
				<div className="rule__header">
					<h3 className="rule__title">
						{utils.isNumber(selectedRuleIndex) ? 'Edit ' : 'Add '} Rule
					</h3>
				</div>

				<div className="rule__content">
					<div className="status-container">
						<h3>Rule Status</h3>
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
					</div>
					<div className="divider" />
					<HeaderBiddingRuleTriggers
						triggers={triggers}
						onAddTrigger={this.handleAddTrigger}
						onRemoveTrigger={this.handleRemoveTrigger}
						dropdownOptions={triggerDropdownOptions}
						onKeyChange={this.handleTriggerKeyChange}
						onValueChange={this.handleTriggerValueChange}
						onOperatorChange={this.handleTriggerOperatorChange}
					/>
					<div className="divider" />
					<HeaderBiddingRuleActions
						actions={actions}
						onAddAction={this.handleAddAction}
						onRemoveAction={this.handleRemoveAction}
						onKeyChange={this.handleActionKeyChange}
						onValueChange={this.handleActionValueChange}
						onBiddersOrderChange={this.handleBiddersOrderChange}
						dropdownOptions={actionDropdownOptions}
					/>
					<div className="divider" />
					<div className="control">
						<Button className="btn-primary" onClick={this.handleSubmit}>
							Save
						</Button>
						<Button className="btn-secondary" onClick={this.goBackToList}>
							Cancel
						</Button>
					</div>
				</div>
			</>
		);
	}

	handleToggleStatus(index, value) {
		const { siteId, showNotification, saveHBRulesAction, setUnsavedChangesAction } = this.props;

		const rule = {
			isActive: value
		};

		saveHBRulesAction(siteId, { rule, ruleIndex: index })
			.then(() => {
				const notification = {
					mode: 'success',
					title: 'Operation Successful',
					message: `Rule updated successfully`,
					autoDismiss: 5
				};

				setUnsavedChangesAction(true);
				showNotification(notification);
				// this.goBackToList(false);
			})
			.catch(error => {
				console.error(error);

				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: error.message,
					autoDismiss: 5
				});
			});
	}

	handleEditRule(index) {
		const { rules } = this.props;
		const { triggers, actions, isActive } = rules[index];

		// convert weekday, weekend value from array to string
		const convertedTriggers = triggers.map(trigger => {
			let convertedValue = trigger.value;

			if (trigger.key == 'day_of_the_week') {
				const weekend = ['saturday', 'sunday'];
				const weekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

				const hasWeekday = weekday.every(day => trigger.value.includes(day));
				const hasWeekend = weekend.every(day => trigger.value.includes(day));

				convertedValue = [];
				hasWeekday && convertedValue.push(weekday.join(','));
				hasWeekend && convertedValue.push(weekend.join(','));
			}

			trigger.value = convertedValue;

			return trigger;
		});

		this.setState(
			{
				isActive,
				actions: _cloneDeep(actions),
				triggers: _cloneDeep(convertedTriggers),
				activeComponent: 'rule-component',
				selectedRuleIndex: index
			},
			() => {
				this.updateIgnoredFields();
				this.updateActionKeyIndexMap();
				this.updateTriggerKeyIndexMap();
			}
		);
	}

	renderListComponent() {
		const { rules, bidders } = this.props;
		const { addedBidders } = bidders;

		let {
			actionKeyOptions,
			actionValueOptions,
			triggerKeyOptions,
			triggerOperatorOptions,
			triggerValueOptions
		} = this.state;

		actionValueOptions = {
			...actionValueOptions,
			bidders_order: Object.values(addedBidders).map(({ name }) => ({ label: name, value: name }))
		};

		return (
			<div className="list-component">
				<HeaderBiddingRulesList
					rules={rules}
					onEditRule={this.handleEditRule}
					onToggleStatus={this.handleToggleStatus}
					triggerKeyOptions={triggerKeyOptions}
					triggerOperatorOptions={triggerOperatorOptions}
					triggerValueOptions={triggerValueOptions}
					actionKeyOptions={actionKeyOptions}
					actionValueOptions={actionValueOptions}
				/>
				<div className="control">
					<Button
						className="btn-primary"
						onClick={() => this.handleActiveComponent('rule-component')}
					>
						Add New Rule
					</Button>
				</div>
			</div>
		);
	}

	renderComponent() {
		const { activeComponent } = this.state;

		return activeComponent === 'list-component'
			? this.renderListComponent()
			: this.renderRuleComponent();
	}

	render() {
		const { showLoader, activeComponent } = this.state;

		if (showLoader) {
			return <Loader />;
		}

		return (
			<div className="hb-rules white-tab-container">
				<div className="page__header">
					<div className="page__title">
						<h3 className="u-margin-t0">Advanced Configuration</h3>
						<p className="u-margin-b4">
							Can result in drastic performance issues. Please contact support if you do not
							understand what this means.
						</p>
					</div>
					{activeComponent !== 'list-component' && (
						<Button className="btn-primary" onClick={this.goBackToList}>
							Go Back to Rules List
						</Button>
					)}
				</div>

				{this.renderComponent()}
			</div>
		);
	}
}

export default OptimizationTab;
