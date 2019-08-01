import React from 'react';
import { Row } from 'react-bootstrap';

const ActionCard = props => {
	const { children, className: classes } = props;
	console.log('classes', classes);

	return (
		<Row className={`${classes || ''} action-card u-border-top-none`}>
			<Row className="content">{children}</Row>
		</Row>
	);
};

ActionCard.propTypes = {};

ActionCard.defaultProps = {};

export default ActionCard;
