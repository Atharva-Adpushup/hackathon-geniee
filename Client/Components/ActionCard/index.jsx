import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-bootstrap';

const ActionCard = props => {
	const { title, children } = props;
	return (
		<Row className="action-card">
			<h3 className="title">{title}</h3>
			<Row className="content">{children}</Row>
		</Row>
	);
};

ActionCard.propTypes = {
	title: PropTypes.string
};

ActionCard.defaultProps = {
	title: 'This is the default title'
};

export default ActionCard;
