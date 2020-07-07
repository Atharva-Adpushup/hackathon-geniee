import React from 'react';
import { Table, Button } from '@/Client/helpers/react-bootstrap-imports';

class HeaderBiddingRulesList extends React.Component {
	renderTable = () => {
		return (
			<Table striped bordered condensed hover responsive size="sm" className="rules-list-table">
				<thead>
					<tr>
						<th>S.No</th>
						<th>Status</th>
						<th>Triggers and Actions</th>
						<th>Edit</th>
					</tr>
				</thead>
				<tbody>{this.renderTableBodyRows()}</tbody>
			</Table>
		);
	};

	renderTableBodyRows = () => {
		const {
			rules,
			onEditRule,
			actionKeyOptions,
			actionValueOptions,
			triggerKeyOptions,
			triggerOperatorOptions,
			triggerValueOptions
		} = this.props;

		const createMapForDropdown = options =>
			options.reduce((map, option) => {
				map[option.value] = option.label;
				return map;
			}, {});

		const triggersKeyMap = createMapForDropdown(triggerKeyOptions);
		const triggersOperatorMap = createMapForDropdown(triggerOperatorOptions);
		const triggersValueMap = Object.keys(triggerValueOptions).reduce((map, key) => {
			map[key] = createMapForDropdown(triggerValueOptions[key]);
			return map;
		}, {});

		const actionsKeyMap = createMapForDropdown(actionKeyOptions);
		const actionsValueMap = Object.keys(actionValueOptions).reduce((map, key) => {
			map[key] = createMapForDropdown(actionValueOptions[key]);
			return map;
		}, {});

		if (!rules.length) {
			return (
				<tr>
					<td colSpan="5" className="text-center u-padding-3">
						No Rules Found
					</td>
				</tr>
			);
		}

		return rules.map((rule, index) => {
			const { isActive, triggers, actions } = rule;

			const triggersContent = triggers.map(trigger => {
				// key, operator, value
				const { key, operator, value } = trigger;
				const keyContent = triggersKeyMap[key];
				const operatorContent = triggersOperatorMap[operator];
				const valueContent = Array.isArray(value)
					? value.map(val => triggersValueMap[key][val]).join(', ')
					: triggersValueMap[key][value];

				return (
					<div className="trigger-content" key={key}>
						<span className="content-item key-content">{keyContent} </span>
						<span className="content-item operator-content">{operatorContent} </span>
						<span className="content-item value-content">{valueContent}</span>
					</div>
				);
			});

			const actionsContent = actions.map(action => {
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
						<span className="content-item key-content">{keyContent} </span>
						<span className="content-item value-content">{valueContent}</span>
					</div>
				);
			});

			return (
				<tr key={`rule-${index}`}>
					<td>{index + 1}</td>
					<td className={isActive ? 'enabled' : 'disabled'}>{isActive ? 'Enabled' : 'Disabled'}</td>
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
				</tr>
			);
		});
	};

	render() {
		return this.renderTable();
	}
}

export default HeaderBiddingRulesList;
