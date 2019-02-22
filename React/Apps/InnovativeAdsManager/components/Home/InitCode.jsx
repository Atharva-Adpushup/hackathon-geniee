import React from 'react';
import { initCode } from '../../configs/commonConsts';
import { CustomButton, CustomMessage } from '../shared/index.jsx';
import { copyToClipBoard } from '../../lib/helpers.js';

const InitCode = props => {
	return (
		<div style={{ padding: '20px' }}>
			<pre style={{ wordWrap: 'break-word', whiteSpace: 'inherit' }}>
				{initCode.replace('__SITE_ID__', window.siteId)}
			</pre>
			<CustomMessage
				header="Important"
				message="This is the init code which you need to copy and paste in your website's head tag. If you have already pasted then ignore this."
				type="info"
			/>
			<CustomButton
				label="Copy Init Code"
				handler={copyToClipBoard.bind(null, initCode.replace('__SITE_ID__', window.siteId))}
			/>
			<div style={{ clear: 'both' }}>&nbsp;</div>
		</div>
	);
};

export default InitCode;
