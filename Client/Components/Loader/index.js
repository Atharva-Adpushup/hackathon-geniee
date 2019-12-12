import React from 'react';
import LoaderLogo from '../../public/assets/images/loaderLogo.png';

const Loader = ({ classNames, height = 'calc(100vh - 115px)' }) => (
	<div className={`loader-container ${classNames}`} style={{ height }}>
		<div className="loaderwrapper spinner" data-id="loader" style={{ display: 'block' }}>
			<img src={LoaderLogo} alt="Loading Logo" />
		</div>
	</div>
);

export default Loader;
