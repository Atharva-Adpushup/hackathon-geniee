import React from 'react';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import PropTypes from 'prop-types';

class SplitScreen extends React.Component {
	state = {};

	render() {
		const {
			rootClassName,
			leftChildren,
			rightChildren,
			leftChildrenClassName,
			rightChildrenClassName
		} = this.props;
		const computedRootClassName = `layout-splitScreen ${rootClassName}`;
		const computedLeftChildrenClassName = `u-margin-0 u-padding-0 layout-splitScreen-cols ${leftChildrenClassName}`;
		const computedRightChildrenClassName = `layout-splitScreen-cols ${rightChildrenClassName}`;

		return (
			<Row className={computedRootClassName}>
				<Col xs={12} sm={12} md={6} lg={6} className={computedLeftChildrenClassName}>
					{leftChildren}
				</Col>
				<Col xs={12} sm={12} md={6} lg={6} className={computedRightChildrenClassName}>
					{rightChildren}
				</Col>
			</Row>
		);
	}
}

SplitScreen.propTypes = {
	leftChildren: PropTypes.element.isRequired,
	rightChildren: PropTypes.element.isRequired,
	rootClassName: PropTypes.string,
	leftChildrenClassName: PropTypes.string,
	rightChildrenClassName: PropTypes.string
};

SplitScreen.defaultProps = {
	rootClassName: '',
	leftChildrenClassName: '',
	rightChildrenClassName: ''
};

export default SplitScreen;
