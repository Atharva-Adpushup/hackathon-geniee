import React, { PropTypes } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

const VariationAdder = (props) => {
	return (
		<div className="variation-adder" id="variationAdder" onClick={props.onNewVariation}>
			<OverlayTrigger placement="top" overlay={<Tooltip id="add-variation-tooltip">Add New Variation</Tooltip>}>
				<i className="fa fa-plus"></i>
			</OverlayTrigger>
		</div>
	);
};


VariationAdder.propTypes = {
	onNewVariation: PropTypes.func.isRequired
};

export default VariationAdder;
