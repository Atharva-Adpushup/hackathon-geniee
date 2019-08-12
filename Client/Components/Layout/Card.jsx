import React from 'react';
import { Panel } from 'react-bootstrap';
import PropTypes from 'prop-types';

class Card extends React.Component {
	state = {};

	render() {
		const {
			type,
			rootClassName,
			headerClassName,
			headerChildren,
			bodyClassName,
			bodyChildren,
			footerClassName,
			footerChildren
		} = this.props;
		const computedRootClassName = rootClassName ? `card ${rootClassName}` : 'card';

		return (
			<Panel className={computedRootClassName} bsStyle={type}>
				{headerChildren ? (
					<Panel.Heading className={headerClassName}>{headerChildren}</Panel.Heading>
				) : null}
				{bodyChildren ? <Panel.Body className={bodyClassName}>{bodyChildren}</Panel.Body> : null}
				{footerChildren ? (
					<Panel.Footer className={footerClassName}>{footerChildren}</Panel.Footer>
				) : null}
			</Panel>
		);
	}
}

Card.propTypes = {
	type: PropTypes.string.isRequired,
	rootClassName: PropTypes.string,
	headerClassName: PropTypes.string,
	bodyClassName: PropTypes.string,
	footerClassName: PropTypes.string,
	headerChildren: PropTypes.element,
	bodyChildren: PropTypes.element.isRequired,
	footerChildren: PropTypes.element
};

Card.defaultProps = {
	rootClassName: '',
	headerClassName: '',
	bodyClassName: '',
	footerClassName: '',
	headerChildren: null,
	footerChildren: null
};

export default Card;
