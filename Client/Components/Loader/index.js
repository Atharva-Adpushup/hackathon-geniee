import React from 'react';
import LoaderLogo from '../../public/assets/images/loaderLogo.png';

const Loader = () => (
	<div className="loaderwrapper spinner" data-id="loader" style={{ display: 'block' }}>
		<img src={LoaderLogo} alt="Loading Logo" />
	</div>
);

export default Loader;
