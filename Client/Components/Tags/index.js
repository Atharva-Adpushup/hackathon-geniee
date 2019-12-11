/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const Tags = props => {
	const { labels, classNames, clickHandler, additionalProps } = props;
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
						<a
							href="#"
							className={`tag ${classNames}`}
							onClick={e => {
								e.preventDefault();
								clickHandler();
							}}
							{...additionalProps}
						>
							{label}
						</a>
					</OverlayTrigger>
				</li>
			))}
		</ul>
	);
};

Tags.defaultProps = {
	classNames: '',
	clickHandler: () => {},
	additionalProps: {}
};

Tags.propTypes = {
	labels: PropTypes.array.isRequired,
	classNames: PropTypes.string,
	clickHandler: PropTypes.func,
	additionalProps: PropTypes.object
};

export default Tags;
