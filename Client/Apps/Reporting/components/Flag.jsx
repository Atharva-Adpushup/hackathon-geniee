import React from 'react';
import '../../../scss/apps/reporting/index.scss';
import ActionCard from '../../../Components/ActionCard';
import config from '../../../../configs/config';

const Flag = () => {
	const { IS_GAM_API_NOT_WORKING } = config;
	const messageToDisplay = IS_GAM_API_NOT_WORKING
		? 'Google AdManager API is facing some issues, reporting data might be delayed'
		: 'Currently we are expecting some delay in our reporting. We are working on it.';

	return (
		<ActionCard className="delay-container">
			<div className="card-heading">Please Note:</div>
			<div className="card-content">{messageToDisplay}</div>
		</ActionCard>
	);
};

export default Flag;
