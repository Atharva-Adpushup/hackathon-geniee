import React, { PropTypes } from 'react';

const VariationAdder = (props) => {
	const style = { height: '100%', width: '30px', backgroundColor: 'red', float: 'left' };
	return (
		<div style={style} id="variationAdder" onClick={props.onNewVariation}>+</div>
	);
};


VariationAdder.propTypes = {
	onNewVariation: PropTypes.func.isRequired
};

export default VariationAdder;
