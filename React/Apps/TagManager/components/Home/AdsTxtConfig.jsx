import React from 'react';
import { adsTxtData } from '../../configs/commonConsts';
import { CustomButton, CustomMessage } from '../shared/index.jsx';
import { copyToClipBoard } from '../../lib/helpers.js';

const AdsTxtConfig = props => {
	return (
		<div style={{ padding: '20px' }}>
			<pre>{adsTxtData}</pre>
			<CustomMessage
				header="Important"
				message="If you have implemented Ads.txt then please copy and paste the above content to your Ads.txt file. You should append the above content to your ads.txt. Do not replace your ads.txt completely."
				type="info"
			/>
			<CustomButton label="Copy Data" handler={copyToClipBoard.bind(null, adsTxtData)} />
			<div style={{ clear: 'both' }}>&nbsp;</div>
		</div>
	);
};

export default AdsTxtConfig;
