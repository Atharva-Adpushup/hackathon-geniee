import React from 'react';
import { Table, Button } from '@/Client/helpers/react-bootstrap-imports';

class HeaderBiddingRulesList extends React.Component {
	renderTable = () => {
		return (
			<Table striped bordered condensed hover>
				<thead>
					<tr>
						<th>S.No</th>
						<th>Status</th>
						<th>Triggers</th>
						<th>Actions</th>
						<th>Edit</th>
					</tr>
				</thead>
				<tbody>{this.renderTableBodyRows()}</tbody>
			</Table>
		);
	};

	renderTableBodyRows = () => {
		const { rules, onEditRule } = this.props;

		if (!rules.length) {
			return (
				<tr>
					<td colSpan="5">No Rule Found</td>
				</tr>
			);
		}

		return rules.map((rule, index) => {
			const { isActive, triggers, actions } = rule;

			return (
				<tr key={`rule-${index}`}>
					<td>{index + 1}</td>
					<td>{isActive ? 'Enabled' : 'Disabled'}</td>
					{/* <td>{triggers}</td> */}
					{/* <td>{actions}</td> */}
					<td>
						<Button onClick={() => onEditRule(index)}>Edit</Button>
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
