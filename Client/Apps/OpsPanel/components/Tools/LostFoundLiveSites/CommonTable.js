import React from 'react';
import { Table } from 'react-bootstrap';

const CommonTable = () => (
	<div>
		<Table striped bordered hover>
			<thead>
				<tr>
					<th>Site Id</th>
					<th>Site Name</th>
				</tr>
			</thead>
		</Table>
	</div>
);

export default CommonTable;
