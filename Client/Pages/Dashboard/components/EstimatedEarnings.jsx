import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const EstimatedEarnings = () => (
	<div className="aligner u-margin-t4 u-margin-b4">
		<div className="aligner-item text-center">
			<div>
				<span>Yestarday</span>
				<span> VS </span>
				<span>Today</span>
			</div>
			<div className="estimatedEarning">
				<span>$100</span>
				<span> / </span>
				<span>$200</span>
			</div>
			<div>
				(<span>50% </span>
				<FontAwesomeIcon icon="arrow-up" /> )
			</div>
		</div>
		<div className="aligner-item text-center">
			<div>
				<span>Previous 7 days</span>
				<span> VS </span>
				<span>Last 7 days</span>
			</div>
			<div className="estimatedEarning">
				<span>$100</span>
				<span> / </span>
				<span>$200</span>
			</div>
			<div>
				(<span>50% </span>
				<FontAwesomeIcon icon="arrow-up" /> )
			</div>
		</div>
		<div className="aligner-item text-center">
			<div>
				<span>Previous 30 days</span>
				<span> VS </span>
				<span>Last 30 days</span>
			</div>

			<div className="estimatedEarning">
				<span>$100</span>
				<span> / </span>
				<span>$200</span>
			</div>
			<div>
				(<span>50% </span>
				<FontAwesomeIcon icon="arrow-down" /> )
			</div>
		</div>
	</div>
);

export default EstimatedEarnings;
