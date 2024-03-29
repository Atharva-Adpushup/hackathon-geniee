import React from 'react';
import { OverlayTrigger, Tooltip } from '@/Client/helpers/react-bootstrap-imports';

function OverlayTooltip({ id, children, tooltip, placement }) {
	return (
		<OverlayTrigger
			overlay={<Tooltip id={id}>{tooltip}</Tooltip>}
			placement={placement}
			delayShow={300}
			delayHide={150}
		>
			{children}
		</OverlayTrigger>
	);
}

export default OverlayTooltip;
