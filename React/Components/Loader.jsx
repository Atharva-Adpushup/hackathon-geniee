import React from 'react';

const Loader = props => {
	return (
		<div className="loaderwrapper spinner" data-id="loader" style={{ display: 'block' }}>
			<img src="/assets/images/loaderLogo.png" />
		</div>
	);
};

export default Loader;
