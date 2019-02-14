import React from 'react';
import PropTypes from 'prop-types';

const Empty = props => {
	const { message } = props;
	return (
		<div className="empty-state">
			<img src="/assets/images/empty.png" alt="Empty" />
			{message ? <h2>{message}</h2> : null}
		</div>
	);
};

Empty.propTypes = { message: PropTypes.string };
Empty.defaultProps = { message: null };

export default Empty;
