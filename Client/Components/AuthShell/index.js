import React from 'react';
import PropTypes from 'prop-types';

const AuthShell = ({ children }) => (
	<main className="aligner aligner--vCenter aligner--hCenter wrapper wrapper--page">
		{children}
	</main>
);

AuthShell.propTypes = {
	children: PropTypes.element.isRequired
};

export default AuthShell;
