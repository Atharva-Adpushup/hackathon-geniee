import React from 'react';
import moment from 'moment';
import { Table, Button } from '@/Client/helpers/react-bootstrap-imports';
import CustomToggleSwitch from '../../../Components/CustomToggleSwitch';

const createMapForDropdown = options =>
	options.reduce((map, option) => {
		// eslint-disable-next-line no-param-reassign
		map[option.value] = option.label;
		return map;
	}, {});

class HeaderBiddingRulesList extends React.Component {
	renderTableBodyRows = () => {
		const {
			rules,
			onEditRule,
			onToggleStatus,
			actionKeyOptions,
			actionValueOptions,
			triggerKeyOptions,
			triggerOperatorOptions,
			triggerValueOptions
		} = this.props;

		if (!rules.length) {
			return (
				<tr>
					<td colSpan="5" className="text-center u-padding-3">
						No Rules Found
					</td>
				</tr>
			);
		}

		const triggersKeyMap = createMapForDropdown(triggerKeyOptions);
		const triggersOperatorMap = createMapForDropdown(triggerOperatorOptions);
		const triggersValueMap = Object.keys(triggerValueOptions).reduce((map, key) => {
			// eslint-disable-next-line no-param-reassign
			map[key] = createMapForDropdown(triggerValueOptions[key]);
			return map;
		}, {});

		const actionsKeyMap = createMapForDropdown(actionKeyOptions);
		const actionsValueMap = Object.keys(actionValueOptions).reduce((map, key) => {
			// eslint-disable-next-line no-param-reassign
			map[key] = createMapForDropdown(actionValueOptions[key]);
			return map;
		}, {});

		return rules.map((rule, index) => {
			const { isActive, triggers, actions, createdAt } = rule;

			const triggersContent = triggers.map((trigger, triggerIndex) => {
				// key, operator, value
				const { key, operator, value } = trigger;
				const keyContent = triggersKeyMap[key];
				const operatorContent = triggersOperatorMap[operator];
				let valueContent;

				if (Array.isArray(value)) {
					let convertedValue = value;

					if (key === 'day_of_the_week') {
						const weekend = ['saturday', 'sunday'];
						const weekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

						const hasWeekday = weekday.every(day => value.includes(day));
						const hasWeekend = weekend.every(day => value.includes(day));

						convertedValue = [];
						if (hasWeekday) convertedValue.push(weekday.join(','));
						if (hasWeekend) convertedValue.push(weekend.join(','));
					}

					valueContent = convertedValue.map(val => triggersValueMap[key][val]).join(', ');
				} else {
					valueContent = triggersValueMap[key][value];
				}

				return (
					<div className="trigger-content" key={key}>
						<span className="content-item serial">{triggerIndex + 1}. </span>
						<span className="content-item key-content">{keyContent}</span>
						<span className="content-item operator-content">
							{operatorContent.replace('IS', '')}
						</span>
						<span className="content-item value-content">{valueContent}</span>
					</div>
				);
			});

			const actionsContent = actions.map((action, actionIndex) => {
				const { key, value } = action;
				const keyContent = actionsKeyMap[key];

				let valueContent = value;

				if (typeof value === 'boolean') {
					valueContent = value ? 'Yes' : 'No';
				} else if (typeof value === 'number') {
					valueContent = key.includes('timeout') ? `${value} ms` : value;
				} else if (Array.isArray(value)) {
					valueContent = value.map(val => actionsValueMap[key][val]).join(', ');
				}

				return (
					<div className="action-content" key={key}>
						<span className="content-item serial">{actionIndex + 1}. </span>
						<span className="content-item key-content">{keyContent}</span>
						<span className="content-item value-content">{valueContent}</span>
					</div>
				);
			});

			return (
				<tr key={`rule-${createdAt}`}>
					<td>{index + 1}</td>
					<td>{moment(createdAt).format('lll')}</td>
					<td>
						<div className="triggers-section">
							<div className="section-heading">Triggers</div>
							<div className="section-data">{triggersContent}</div>
						</div>
						<div className="actions-section">
							<div className="section-heading">Actions</div>
							<div className="section-data">{actionsContent}</div>
						</div>
					</td>
					<td>
						<Button className="btn-primary" onClick={() => onEditRule(index)}>
							Edit
						</Button>
					</td>
					<td>
						<CustomToggleSwitch
							defaultLayout
							checked={isActive}
							onChange={value => onToggleStatus(index, value)}
							name={`rule-status-${index}`}
							layout="nolabel"
							size="m"
							id={`rule-status-${index}`}
							on="Enable"
							off="Disable"
						/>
					</td>
				</tr>
			);
		});
	};

	render() {
		return (
			<Table striped bordered condensed hover responsive size="sm" className="rules-list-table">
				<thead>
					<tr>
						<th>S.No</th>
						<th>Date Added</th>
						<th>Rules</th>
						<th>Edit</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>{this.renderTableBodyRows()}</tbody>
			</Table>
		);
	}
}

export default HeaderBiddingRulesList;
