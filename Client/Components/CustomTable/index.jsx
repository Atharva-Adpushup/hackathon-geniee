import React from 'react';
import { Table } from '@/Client/helpers/react-bootstrap-imports';
import Head from './Head';
import Body from './Body';

class CustomTable extends React.Component {
	render() {
		const { headers, body } = this.props;

		return (
			<div>
				<Table striped bordered hover>
					<Head headers={headers} />
					<Body body={body} />
				</Table>
			</div>
		);
	}
}

export default CustomTable;

/*
	This is a custom table component which have
	1. Table Headers
		- Array of Strings
		- Order Matters
	2. Table Body
		- Array of Objects
			- Each Object represents a table row
			- Each Object key represents a td
			- Content of Td can be anything
				- String
				- Number
				- JSX
				- Any other valid value
				[
					{ // Row
						data: {
							{data: 1, actions: [name: 'edit', handler: '']},
							google.com
						},
						actions: {}
					},
					{ // Row
						data: {},
						actions: {}
					}
				]
			- Order Matters
			[
				{
					type: 'input' | 'select'
				}
			]
	3. Filters
*/
