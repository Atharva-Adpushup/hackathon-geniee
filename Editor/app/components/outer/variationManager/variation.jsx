import React, { PropTypes } from 'react';

const style = {
	float: 'left',
	margin: '5px',
	border: '1px black solid'
};

class Variation extends React.Component {
	constructor() {
		super();
	}

	render({ variation, onClick, onCopy, active } = this.props) {
		return (<div onDoubleClick={onCopy.bind(null, variation)} onClick={onClick} className="variationBlock" style={{ ...style, color: active ? 'red' : 'white' }}>{variation.name}</div>);
	}
}

Variation.propTypes = {
	variation: PropTypes.object.isRequired,
	onClick: PropTypes.func.isRequired,
	onDoubleClick: PropTypes.func.isRequired
};

export default Variation;

