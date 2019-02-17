import React from 'react';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';

class SplitScreen extends React.Component {
	state = {};

	render() {
		const { leftChildren, rightChildren } = this.props;

		return (
			<Row className="layout-splitScreen u-padding-h4 u-padding-v5">
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
	rightChildren: PropTypes.element.isRequired
};

SplitScreen.defaultProps = {
	leftChildren: function() {
		return <div>Left panel data</div>;
	},
	rightChildren: function() {
		return <div>Right panel data</div>;
	}
};

export default SplitScreen;
