import React from 'react';
import { Table } from 'react-bootstrap';

const RetentionSites = ({ data }) => (
	<div>
		<Table striped bordered hover>
			<thead>
				<tr>
					<th>Site Id</th>
					<th>Site Name</th>
				</tr>
			</thead>

			<tbody>
				{data.map(val => (
					<tr key={val.siteid}>
						<td>{val.siteid}</td>
						<td>{val.site}</td>
					</tr>
				))}
			</tbody>
		</Table>{' '}
	</div>
);

export default RetentionSites;
