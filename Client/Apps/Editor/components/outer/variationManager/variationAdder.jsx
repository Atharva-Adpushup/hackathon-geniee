import React, { PropTypes } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

const VariationAdder = props => {
	return (
		<OverlayTrigger placement="top" overlay={<Tooltip id="add-variation-tooltip">Add New Variation</Tooltip>}>
			<div className="variation-adder" id="variationAdder" onClick={props.onNewVariation}>
				Add <i className="fa fa-plus" />
			</div>
		</OverlayTrigger>
	);
};

VariationAdder.propTypes = {
	onNewVariation: PropTypes.func.isRequired
};

export default VariationAdder;
