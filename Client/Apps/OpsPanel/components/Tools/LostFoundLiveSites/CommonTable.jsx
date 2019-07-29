import React from 'react';
import { Table } from 'react-bootstrap';
import Empty from '../../../../../Components/Empty/index';

const CommonTable = ({ data }) =>
	!data || data.length === 0 ? (
		<Empty message=" No Data found for the following dates" />
	) : (
		<div className="u-padding-3">
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
export default CommonTable;
