import React from 'react';
import { adsTxtData } from '../../configs/commonConsts';
import { CustomButton } from '../shared/index.jsx';
import { copyToClipBoard } from '../../lib/helpers.js';

const AdsTxtConfig = props => {
	return (
		<div style={{ padding: '20px' }}>
			<pre>{adsTxtData}</pre>
			<CustomButton label="Copy Data" handler={copyToClipBoard.bind(null, adsTxtData)} />
			<div style={{ clear: 'both' }}>&nbsp;</div>
		</div>
	);
};

export default AdsTxtConfig;
