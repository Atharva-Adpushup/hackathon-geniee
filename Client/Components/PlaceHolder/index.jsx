import React from 'react';
import { Row } from '@/Client/helpers/react-bootstrap-imports';
import PropTypes from 'prop-types';

class PlaceHolder extends React.Component {
	state = {};

	render() {
		const { rootClassName, alignedElementClassName, children } = this.props;
		const computedRootClassName = `placeholder aligner aligner--vCenter aligner--hCenter ${rootClassName}`;
		const computedElementClassName =
			alignedElementClassName || 'aligner aligner--column aligner--vCenter aligner--hCenter';

		return (
			<div className={computedRootClassName}>
				<div className={computedElementClassName}>{children}</div>
			</div>
		);
	}
}

PlaceHolder.propTypes = {
	rootClassName: PropTypes.string,
	alignedElementClassName: PropTypes.string
};

PlaceHolder.defaultProps = {
	rootClassName: '',
	alignedElementClassName: ''
};

export default PlaceHolder;
