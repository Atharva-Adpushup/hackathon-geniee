import React, { PropTypes } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

const Variation = ({ variation, toggleVariationPanel, onClick, active }) => {
	const isDisabled = !!variation.disable;
	let rootClassName = 'variation-block',
		activeClassName = active ? ' active-variation' : '',
		disabledClassName = isDisabled ? ' disabled-variation' : '';

	rootClassName += `${activeClassName}${disabledClassName}`;

	return (
		<div onClick={active ? toggleVariationPanel : onClick.bind(null, variation.id)} className={rootClassName}>
			{variation.name}
			{variation.isControl ? (
				<OverlayTrigger
					placement="top"
					overlay={<Tooltip id="baseline-variation-tooltip">This is Baseline Variation</Tooltip>}
				>
					<span className="variation-settings-icon">
						<i className="text-bold">B</i>
					</span>
				</OverlayTrigger>
			) : null}
			{variation.disable ? (
				<OverlayTrigger
					placement="top"
					overlay={<Tooltip id="disable-variation-tooltip">This variation is disabled</Tooltip>}
				>
					<span className="variation-settings-icon">
						<i className="fa fa-ban" />
					</span>
				</OverlayTrigger>
			) : null}
			{active ? (
				<span className="variation-settings-icon">
					<i className="fa fa-caret-up" />
				</span>
			) : (
				''
			)}
		</div>
	);
};

Variation.propTypes = {
	variation: PropTypes.object.isRequired,
	active: PropTypes.bool.isRequired,
	onClick: PropTypes.func.isRequired,
	toggleVariationPanel: PropTypes.func.isRequired
};

export default Variation;
