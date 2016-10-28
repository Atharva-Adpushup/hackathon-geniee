import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

const variationSections = (props) => {
	const { variation, channelId } = props;
	return (
		<div>
			<h1 className="variation-section-heading">Variataion Sections</h1>

		</div>
	);
};

variationSections.propTypes = {
	variation: PropTypes.object.isRequired,
	channelId: PropTypes.string.isRequired
};

export default connect(
	(state, ownProps) => ({ ...ownProps }),
	(dispatch) => bindActionCreators({

	}, dispatch)
	)(variationSections);

