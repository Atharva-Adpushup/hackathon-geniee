import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const Tags = props => {
	const { labels = [] } = props;
	if (!labels.length) {
		return null;
	}
	return (
		<ul className="tags">
			{labels.map((label, key) => (
				<li key={key}>
					<OverlayTrigger
						placement="bottom"
						overlay={
							<Tooltip id={`custom-tooltip-${key}-${label}}`}>{label.replace(':', '-')}</Tooltip>
						}
						key={`custom-overlay-${key}-${label}}`}
					>
						<a href="#" className="tag" onClick={e => e.preventDefault()}>
							{label}
						</a>
					</OverlayTrigger>
				</li>
			))}
		</ul>
	);
};

export default Tags;
