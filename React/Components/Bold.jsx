import React from 'react';

const Bold = props => {
	const styles = {
		fontWeight: 700,
		color: '#000'
	};

	return <strong style={styles}>{props.children}</strong>;
};

export default Bold;
