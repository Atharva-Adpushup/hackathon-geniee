import React from 'react';
import { Table } from 'react-bootstrap';

const NewSites = ({ data }) => (
	<div className="u-padding-2">
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
		</Table>
	</div>
);

export default NewSites;
