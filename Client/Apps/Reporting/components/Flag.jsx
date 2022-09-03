import React from 'react';
import '../../../scss/apps/reporting/index.scss';
import ActionCard from '../../../Components/ActionCard';

const Flag = () => (
	<ActionCard className="delay-container">
		<div className="card-heading">Please Note:</div>
		<div className="card-content">
			Currently we are expecting some delay in our reporting. We are working on it.
		</div>
	</ActionCard>
);

export default Flag;
