import React from 'react';
import { Row } from '@/Client/helpers/react-bootstrap-imports';

const ActionCard = props => {
	const { children, className: classes } = props;

	return (
		<Row className={`${classes || ''} action-card u-border-top-none`}>
			<Row className="content">{children}</Row>
		</Row>
	);
};

ActionCard.propTypes = {};

ActionCard.defaultProps = {};

export default ActionCard;
