import React from 'react';

class Head extends React.Component {
	render() {
		const { headers } = this.props;
		return (
			<thead>
				<tr>
					{headers.map(header => (
						<th key={`headerKey-${header}`}>{header}</th>
					))}
				</tr>
			</thead>
		);
	}
}

export default Head;
