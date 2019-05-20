import React from 'react';
import Td from './Td';

class Body extends React.Component {
	constructor(props) {
		super(props);
		this.identifier = 0;
	}

	getIdentifier() {
		this.incrementIdentifier();
		return this.identifier;
	}

	incrementIdentifier() {
		this.identifier += 1;
	}

	render() {
		const { body } = this.props;
		return (
			<tbody>
				{body.map(content => (
					<tr className="custom-table-row" key={this.getIdentifier()}>
						<Td content={content} />
					</tr>
				))}
			</tbody>
		);
	}
}

export default Body;
