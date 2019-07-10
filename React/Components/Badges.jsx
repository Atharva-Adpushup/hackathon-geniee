import React from 'react';
import _ from 'lodash';

const Badges = props => {
	let labelClasses = props.labelClasses || false;
	return (
		<div>
			{_.map(props.iterable, (value, key) => {
				return (
					<label key={key} className={`section-label ${labelClasses ? labelClasses : ''}`}>
						<span
							onClick={props.clickHandler ? props.clickHandler : () => {}}
							data-type={props.type ? props.type : ''}
							data-extra={props.extra ? props.extra : ''}
							data-value={value}
						>
							{value}
						</span>
					</label>
				);
			})}
		</div>
	);
};

export default Badges;
