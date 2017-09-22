import React, { PropTypes } from 'react';

const Variation = ({ variation, toggleVariationPanel, onClick, active }) => (
	<div
		onClick={active ? toggleVariationPanel : onClick.bind(null, variation.id)}
		className={active ? 'variation-block active-variation' : 'variation-block'}
	>
		{variation.name}{' '}
		{active ? (
			<span className="variation-settings-icon">
				<i className="fa fa-caret-up" />
			</span>
		) : (
			''
		)}
	</div>
);

Variation.propTypes = {
	variation: PropTypes.object.isRequired,
	active: PropTypes.bool.isRequired,
	onClick: PropTypes.func.isRequired,
	toggleVariationPanel: PropTypes.func.isRequired
};

export default Variation;
