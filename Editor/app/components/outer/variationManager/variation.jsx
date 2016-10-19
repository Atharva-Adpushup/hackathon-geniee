import React, { PropTypes } from 'react';

class Variation extends React.Component {
	constructor() {
		super();
	}

	render({ variation, onClick, onCopy, active } = this.props) {
		return (<div onDoubleClick={onCopy.bind(null, variation)} onClick={onClick} className={active ? 'variation-block active-variation' : 'variation-block'}>{variation.name}</div>);
	}
}

Variation.propTypes = {
	variation: PropTypes.object.isRequired,
	onClick: PropTypes.func.isRequired,
	onDoubleClick: PropTypes.func.isRequired
};

export default Variation;

