/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
/* eslint-disable consistent-return */
/* eslint-disable react/sort-comp */
import React from 'react';
import _omitBy from 'lodash/omitBy';
import _cloneDeep from 'lodash/cloneDeep';

import { Button } from '@/Client/helpers/react-bootstrap-imports';

import history from '../../../../../helpers/history';
import utils from '../../../../../helpers/utils';
import axiosInstance from '../../../../../helpers/axiosInstance';
import HeaderBiddingRuleActions from '../../../../HeaderBidding/components/HeaderBiddingRuleActions';
import HeaderBiddingRuleTriggers from '../../../../HeaderBidding/components/HeaderBiddingRuleTriggers';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch';
import Loader from '../../../../../Components/Loader';
import HeaderBiddingRulesList from '../../../../HeaderBidding/components/HeaderBiddingRulesList';
import {
	TRIGGER_KEY_OPTIONS,
	TRIGGER_OPERATOR_OPTIONS,
	ACTION_KEY_OPTIONS,
	WEEKEND,
	WEEKDAY
} from '../../../configs/commonConsts';

const getDefaultState = () => ({
	isActive: true,
	selectedRuleIndex: null,
	activeComponent: 'list-component',
	triggers: [],
	actions: [],
	actionKeyIndexMap: {},
	triggerKeyIndexMap: {},
	ruleDescription: ''
});

const getConvertedBiddersData = bidders => {
	return Object.keys(bidders).map(bidderCode => {
		const { name } = bidders[bidderCode];
		return {
			label: name,
			value: bidderCode
		};
	});
};

const getTemplate = type => {
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
};

const getResetValueForAction = actionKey => {
	const arrayTypes = ['allowed_bidders', 'disallowed_bidders'];
	if (arrayTypes.includes(actionKey)) return [];
	return null;
};

class BidderRules extends React.Component {
	constructor(props) {
		super(props);
		const { bidders } = props;

		const allowedBidders = getConvertedBiddersData(bidders);

		this.state = {
			showLoader: true,
			selectedRuleIndex: null,
			activeComponent: 'list-component',
			isActive: true,
			triggers: [],
			actions: [],
			actionKeyOptions: ACTION_KEY_OPTIONS,
			actionValueOptions: {
				allowed_bidders: allowedBidders,
				disallowed_bidders: allowedBidders
			},
			triggerKeyOptions: TRIGGER_KEY_OPTIONS,
			triggerOperatorOptions: TRIGGER_OPERATOR_OPTIONS,
			triggerValueOptions: {
				country: [],
				device: [],
				time_range: [],
				day_of_the_week: []
			},
			actionKeyIndexMap: {},
			triggerKeyIndexMap: {},

			// required for getDerivedStateFromProps
			bidders
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.resetState = this.resetState.bind(this);
		this.handleEditRule = this.handleEditRule.bind(this);
		this.handleToggleStatus = this.handleToggleStatus.bind(this);
		this.handleRuleStatusChange = this.handleRuleStatusChange.bind(this);
		this.handleChange = this.handleChange.bind(this);

		this.handleAddTrigger = this.handleAddTrigger.bind(this);
		this.handleRemoveTrigger = this.handleRemoveTrigger.bind(this);
		this.handleTriggerKeyChange = this.handleTriggerKeyChange.bind(this);
		this.handleTriggerOperatorChange = this.handleTriggerOperatorChange.bind(this);
		this.handleTriggerValueChange = this.handleTriggerValueChange.bind(this);

		this.handleAddAction = this.handleAddAction.bind(this);
		this.handleRemoveAction = this.handleRemoveAction.bind(this);
		this.handleActionKeyChange = this.handleActionKeyChange.bind(this);
		this.handleActionValueChange = this.handleActionValueChange.bind(this);
	}

	componentDidMount() {
		this.getMetaData();
	}

	getMetaData() {
		axiosInstance
			.get('headerBidding/rules/meta')
			.then(({ data }) => {
				const { countries, devices, days, timeSlots } = data;
				this.setState(state => ({
					actionValueOptions: {
						...state.actionValueOptions
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
				// eslint-disable-next-line no-console
				console.error(error.message);
				history.push('/error');
			})
			.then(() => {
				this.setState({
					showLoader: false
				});
			});
	}

	// ------------------------------ action ----------------------------

	handleAddAction() {
		this.setState(state => ({
			...state,
			actions: [...state.actions, getTemplate('action')]
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

		// eslint-disable-next-line no-restricted-syntax
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

		actionKeyOptions.forEach(option => {
			const selectedFor = actionKeyIndexMap[option.value];

			const item = {
				...option,
				selectedFor
			};

			// eslint-disable-next-line no-nested-ternary
			enabledOptions.push(item);
		});

		const filteredActionKeyOptions = [...enabledOptions];

		return {
			keyOptions: filteredActionKeyOptions,
			valueOptions: actionValueOptions
		};
	}

	handleActionKeyChange(index, { value, isIgnored, isIgnoredMessage }) {
		this.setState(state => {
			const { actions, actionKeyIndexMap } = state;
			const newActions = [...actions];

			const action = {
				...newActions[index],
				key: value,
				value: getResetValueForAction(value),
				keyError: null,
				valueError: null,
				isIgnored: !!isIgnored,
				isIgnoredMessage: isIgnored ? isIgnoredMessage : null
			};

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
		let parsedNumber = null;
		let selectedValue = null;

		switch (valueType) {
			case 'dropdown':
				value = Array.isArray(selection) ? selection.map(({ value: val }) => val) : selection.value;
				error = value.length === 0 ? 'Please select an option' : null;

				break;

			case 'number':
				selection.persist();

				selectedValue = selection.target.value;
				parsedNumber = parseInt(selectedValue, 10);
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

	// ------------------------------ trigger ----------------------------

	handleAddTrigger() {
		this.setState(state => ({
			...state,
			triggers: [...state.triggers, getTemplate('trigger')]
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
		};

		this.setState(stateHandler, afterStateUpdate);
	}

	updateTriggerKeyIndexMap() {
		const { triggers, triggerKeyOptions, triggerKeyIndexMap } = this.state;
		const updatedTriggerKeyIndexMap = { ...triggerKeyIndexMap };

		// eslint-disable-next-line no-restricted-syntax
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

		triggerKeyOptions.forEach(option => {
			const selectedFor = triggerKeyIndexMap[option.value];

			const item = {
				...option,
				selectedFor
			};

			// eslint-disable-next-line no-nested-ternary
			enabledOptions.push(item);
		});

		const filteredTriggerKeyOptions = [...enabledOptions];

		return {
			valueOptions: triggerValueOptions,
			keyOptions: filteredTriggerKeyOptions,
			operatorOptions: triggerOperatorOptions
		};
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

		this.setState(stateHandler);
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

		const preparedValue = Array.isArray(value) ? value.map(({ value: val }) => val) : [];

		newTriggers[index].value = preparedValue;
		newTriggers[index].valueError = preparedValue.length === 0 ? 'Please select an option' : null;

		this.setState(state => ({ ...state, triggers: newTriggers }));
	}

	// ------------------------------ global ------------------------

	validateBeforeSubmit() {
		const { showNotification } = this.props;
		const { triggers, actions } = this.state;

		let notificationTime = 0;
		const notificationMessage = [];

		let hasIgnoredTrigger = false;
		let hasIgnoredAction = false;
		let hasMinimumOneValidTrigger = false;
		let hasMinimumOneValidAction = false;

		let hasInvalidActionValues = false;
		let hasInvalidTriggerValues = false;

		const updatedTriggers = [];
		const updatedActions = [];

		// set error for key, operator, value of trigger if not valid
		// eslint-disable-next-line no-plusplus
		for (let index = 0; index < triggers.length; index++) {
			const trigger = triggers[index];

			const hasInvalidKey = !trigger.key || trigger.keyError;
			const hasInvalidOperator = !trigger.operator || trigger.operatorError;
			const hasInvalidValue =
				trigger.value === null ||
				(Array.isArray(trigger.value) && trigger.value.length === 0) ||
				trigger.valueError;

			if (hasInvalidKey || hasInvalidOperator || hasInvalidValue) {
				hasInvalidTriggerValues = true;
			}

			if (!trigger.isIgnored) {
				hasMinimumOneValidTrigger = true;
			} else {
				hasIgnoredTrigger = true;
			}

			trigger.keyError = trigger.keyError || (hasInvalidKey ? 'Please select an option' : '');
			trigger.operatorError =
				trigger.operatorError || (hasInvalidOperator ? 'Please select an option' : '');
			trigger.valueError = trigger.valueError || (hasInvalidValue ? 'Please select an option' : '');

			updatedTriggers.push(trigger);
		}

		// set error for key, value of action if not valid
		// eslint-disable-next-line no-plusplus
		for (let index = 0; index < actions.length; index++) {
			const action = actions[index];

			const hasInvalidKey = !action.key || action.keyError;
			const hasInvalidValue =
				action.value === null ||
				(Array.isArray(action.value) && action.value.length === 0) ||
				action.valueError;

			if (hasInvalidKey || hasInvalidValue) {
				hasInvalidActionValues = true;
			}

			if (!action.isIgnored) {
				hasMinimumOneValidAction = true;
			} else {
				hasIgnoredAction = true;
			}

			action.keyError = action.keyError || (hasInvalidKey ? 'Please select an option' : '');
			action.valueError = action.valueError || (hasInvalidValue ? 'Please select an option' : '');

			updatedActions.push(action);
		}

		if (!hasMinimumOneValidAction || !hasMinimumOneValidTrigger) {
			let message = '';

			if (!hasMinimumOneValidAction) {
				message = `Please add atleast one${hasIgnoredAction ? ' valid' : ''} Action`;
			}

			if (!hasMinimumOneValidTrigger) {
				message = message.length
					? `${message} and one${hasIgnoredTrigger ? ' valid' : ''} Trigger`
					: `Please add atleast one${hasIgnoredTrigger ? ' valid' : ''} Trigger`;
			}

			notificationTime = 5;
			notificationMessage.push(message);
		}

		if (hasIgnoredAction || hasIgnoredTrigger) {
			const message = 'Please remove the fields that can not be used';
			notificationTime = notificationTime === 0 ? 5 : notificationTime + 4;
			notificationMessage.push(message);
		}

		if (hasInvalidActionValues || hasInvalidTriggerValues) {
			const message = 'Please fill all the details with valid data before proceeding';
			notificationTime = notificationTime === 0 ? 5 : notificationTime + 4;
			notificationMessage.push(message);

			const updatedState = {};

			if (hasInvalidActionValues) {
				updatedState.actions = updatedActions;
			}
			if (hasInvalidTriggerValues) {
				updatedState.triggers = updatedTriggers;
			}

			this.setState(updatedState);
		}

		if (notificationMessage.length) {
			const hasMultipleMessages = notificationMessage.length > 1;
			let message = '';
			notificationMessage.forEach((msg, index) => {
				if (hasMultipleMessages) {
					message += `${index + 1}. ${msg} <br/>`;
				} else {
					message = msg;
				}
			});

			showNotification({
				message,
				mode: 'error',
				title: 'Error',
				autoDismiss: notificationTime
			});
		}

		return (
			hasIgnoredAction ||
			hasIgnoredTrigger ||
			hasInvalidActionValues ||
			hasInvalidTriggerValues ||
			!hasMinimumOneValidAction ||
			!hasMinimumOneValidTrigger
		);
	}

	handleChange(event) {
		this.setState({
			[event.target.name]: event.target.value || ' '
		});
	}

	handleSubmit() {
		const {
			showNotification,
			saveNetworkWideRules,
			setUnsavedChangesAction,
			customProps
		} = this.props;
		const { triggers, actions, isActive, selectedRuleIndex, ruleDescription } = this.state;

		const hasInvalidData = this.validateBeforeSubmit();

		if (hasInvalidData) {
			return false;
		}

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: ''
		};

		const triggersData = triggers.reduce((data, trigger) => {
			const { isIgnored, key, operator, value } = trigger;

			if (isIgnored) return data;

			let convertedValue = value;

			if (key === 'day_of_the_week') {
				convertedValue = trigger.value.reduce((output, val) => {
					// eslint-disable-next-line no-param-reassign
					output = output.concat(val.split(','));
					return output;
				}, []);
			}

			data.push({
				key,
				operator,
				value: convertedValue
			});
			return data;
		}, []);

		const actionsData = actions.reduce((data, action) => {
			const { isIgnored, key, operator, value } = action;

			if (isIgnored) return data;

			const convertedValue = value;

			data.push({
				key,
				operator,
				value: convertedValue
			});

			return data;
		}, []);

		// save the rule
		const rule = {
			isActive,
			actions: actionsData,
			triggers: triggersData,
			description: ruleDescription,
			isGlobal: true
		};

		saveNetworkWideRules({ rule, ruleIndex: selectedRuleIndex }, dataForAuditLogs)
			.then(() => {
				const notification = {
					mode: 'success',
					title: 'Operation Successful',
					message: `Rule ${utils.isNumber(selectedRuleIndex) ? 'updated' : 'added'} successfully`,
					autoDismiss: 5
				};

				setUnsavedChangesAction(true);
				showNotification(notification);
				this.resetState(false);
			})
			.catch(error => {
				// eslint-disable-next-line no-console
				console.error(error);

				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: error.message,
					autoDismiss: 5
				});
			});
	}

	resetState(getConfirmation = true) {
		const confirmed =
			getConfirmation && window.confirm('Are you sure? Any unsaved changes made will be lost!');

		if (getConfirmation && !confirmed) return;

		this.setState({ ...getDefaultState() });
	}

	handleRuleStatusChange(status) {
		this.setState({
			isActive: status
		});
	}

	handleAddNewRule() {
		this.setState({
			...getDefaultState(),
			activeComponent: 'rule-component'
		});
	}

	renderRuleComponent() {
		const { actions, triggers, isActive, selectedRuleIndex, ruleDescription } = this.state;

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
					<div className="description-container">
						<h3>Rule Description</h3>
						<textarea
							type="text"
							name="ruleDescription"
							required
							placeholder=" Enter Rule Description/Name...."
							value={ruleDescription}
							onChange={this.handleChange}
							className="u-margin-t2"
						/>
					</div>
					<div className="status-container u-margin-t4">
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
						dropdownOptions={actionDropdownOptions}
						isForOps
					/>
					<div className="divider" />
					<div className="control">
						<Button className="btn-primary" onClick={this.handleSubmit}>
							Save
						</Button>
						<Button className="btn-secondary" onClick={this.resetState}>
							Cancel
						</Button>
					</div>
				</div>
			</>
		);
	}

	handleToggleStatus(index, value) {
		const {
			showNotification,
			saveNetworkWideRules,
			setUnsavedChangesAction,
			customProps
		} = this.props;

		const rule = {
			isActive: value
		};
		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: ''
		};

		saveNetworkWideRules({ rule, ruleIndex: index }, dataForAuditLogs)
			.then(() => {
				const notification = {
					mode: 'success',
					title: 'Operation Successful',
					message: `Rule updated successfully`,
					autoDismiss: 5
				};

				setUnsavedChangesAction(true);
				showNotification(notification);
			})
			.catch(error => {
				// eslint-disable-next-line no-console
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

		const { triggers = [], actions = [], isActive, description } = _cloneDeep(rules)[index];

		// convert weekday, weekend value from array to string
		const convertedTriggers = triggers.map(trigger => {
			let convertedValue = trigger.value;

			if (trigger.key === 'day_of_the_week') {
				const hasWeekday = WEEKDAY.every(day => trigger.value.includes(day));
				const hasWeekend = WEEKEND.every(day => trigger.value.includes(day));

				convertedValue = [];
				if (hasWeekday) convertedValue.push(WEEKDAY.join(','));
				if (hasWeekend) convertedValue.push(WEEKEND.join(','));
			}

			// eslint-disable-next-line no-param-reassign
			trigger.value = convertedValue;

			return trigger;
		});

		const convertedActions = actions.map(action => {
			const { value } = action;

			const convertedValue = value;

			// eslint-disable-next-line no-param-reassign
			action.value = convertedValue;

			return action;
		});

		this.setState(
			{
				isActive,
				actions: convertedActions,
				triggers: convertedTriggers,
				activeComponent: 'rule-component',
				selectedRuleIndex: index,
				ruleDescription: description
			},
			() => {
				this.updateActionKeyIndexMap();
				this.updateTriggerKeyIndexMap();
			}
		);
	}

	renderListComponent() {
		const { rules, bidders } = this.props;

		const {
			actionKeyOptions,
			actionValueOptions,
			triggerKeyOptions,
			triggerOperatorOptions,
			triggerValueOptions
		} = this.state;

		const modifiedActionValueOptions = {
			...actionValueOptions,
			bidders_order: getConvertedBiddersData(bidders)
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
					actionValueOptions={modifiedActionValueOptions}
					isForOps
				/>
				<div className="control">
					<Button className="btn-primary" onClick={() => this.handleAddNewRule()}>
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
						<h3 className="u-margin-t0 u-margin-b4">Advanced Configuration</h3>
					</div>
					{activeComponent !== 'list-component' && (
						<Button className="btn-primary" onClick={this.resetState}>
							Go Back to Rules List
						</Button>
					)}
				</div>

				{this.renderComponent()}
			</div>
		);
	}
}

export default BidderRules;
