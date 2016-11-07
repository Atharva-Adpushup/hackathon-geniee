import React, { PropTypes } from 'react';

const variationSections = (props) => {
	return (
		<div>
			<h1 className="variation-section-heading">Variation Sections</h1>
		</div>
	);
};

variationSections.propTypes = {
	variation: PropTypes.object.isRequired,
	channelId: PropTypes.string.isRequired
};

export default variationSections;
