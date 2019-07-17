import React, { Component } from 'react';

class Td extends Component {
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

	renderInformation(value, actions = [], maxWidth = '80px') {
		return (
			<td key={`infoKey-${this.getIdentifier()}`} className="ad-td" style={{ maxWidth }}>
				{value}
				{actions.length ? this.renderActions(actions) : null}
			</td>
		);
	}

	render() {
		const { content } = this.props;

		return content.map(td => {
			this.renderInformation();
		});
	}
}

export default Td;
