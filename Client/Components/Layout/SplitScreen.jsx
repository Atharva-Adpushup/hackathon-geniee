import React from 'react';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';

class SplitScreen extends React.Component {
	state = {};

	render() {
		const { rootClassName, leftChildren, rightChildren } = this.props;
		const computedRootClassName = `layout-splitScreen ${rootClassName}`;

		return (
			<Row className={computedRootClassName}>
				<Col
					xs={12}
					sm={12}
					md={6}
					lg={6}
					className="u-margin-0 u-padding-0 layout-splitScreen-cols"
				>
					{leftChildren}
				</Col>
				<Col xs={12} sm={12} md={6} lg={6} className="layout-splitScreen-cols">
					{rightChildren}
				</Col>
			</Row>
		);
	}
}

SplitScreen.propTypes = {
	leftChildren: PropTypes.element.isRequired,
	rightChildren: PropTypes.element.isRequired,
	rootClassName: PropTypes.string
};

SplitScreen.defaultProps = {
	rootClassName: ''
};

export default SplitScreen;
