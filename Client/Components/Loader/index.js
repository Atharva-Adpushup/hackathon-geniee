import React from 'react';
import LoaderLogo from '../../public//assets/images/loaderLogo.png';

const Loader = props => {
	return (
		<div className="loaderwrapper spinner" data-id="loader" style={{ display: 'block' }}>
			<img src={LoaderLogo} />
		</div>
	);
};

export default Loader;