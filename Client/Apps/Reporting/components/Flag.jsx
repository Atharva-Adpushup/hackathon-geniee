import React from 'react';
import '../../../scss/apps/reporting/index.scss';
import ActionCard from '../../../Components/ActionCard';

const Flag = ({ isIssueWithGAM }) => {
	const messageToDisplay = isIssueWithGAM
		? 'Google AdManager API is facing some issues, reporting data might be delayed'
		: 'Currently we are expecting some delay in our reporting for 3rd Jan and 4th Jan. We are working on it.';

	return (
		<ActionCard className="delay-container">
			<div className="card-heading">Please Note:</div>
			<div className="card-content">{messageToDisplay}</div>
		</ActionCard>
	);
};

export default Flag;
