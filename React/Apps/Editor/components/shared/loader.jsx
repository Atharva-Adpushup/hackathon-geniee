import React, { PropTypes } from 'react';

const Loader = props => (
	<div data-id="loader" style={{ display: props.loading ? 'block' : 'none' }} className="loaderwrapper spinner">
		<img alt="loader" src="/assets/images/loaderLogo.png" />
	</div>
);

Loader.propTypes = {
	loading: PropTypes.bool.isRequired
};

Loader.defaultProps = {
	loading: false
};

export default Loader;
