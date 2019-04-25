import React from 'react';
import PropTypes from 'prop-types';

class HeroFeature extends React.Component {
	state = {};

	render() {
		const { rootClassName, leftChildren, imageUrl, imageAlt, leftChildrenClassName } = this.props;
		const computedRootClassName = `layout-heroFeature aligner aligner--row aligner--hCenter aligner--vCenter u-width-full ${rootClassName}`;
		const computedLeftChildrenClassName = `layout-heroFeature-description aligner aligner--column aligner--hCenter aligner--vCenter ${leftChildrenClassName}`;
		const computedRightChildrenClassName = `layout-heroFeature-image aligner aligner--hCenter aligner--vCenter`;

		return (
			<div className={computedRootClassName}>
				<div className={computedLeftChildrenClassName}>{leftChildren}</div>
				<div className={computedRightChildrenClassName}>
					<img src={imageUrl} alt={imageAlt} />
				</div>
			</div>
		);
	}
}

HeroFeature.propTypes = {
	leftChildren: PropTypes.element.isRequired,
	imageUrl: PropTypes.string.isRequired,
	imageAlt: PropTypes.string.isRequired,
	rootClassName: PropTypes.string,
	leftChildrenClassName: PropTypes.string
};

HeroFeature.defaultProps = {
	rootClassName: '',
	leftChildrenClassName: ''
};

export default HeroFeature;
