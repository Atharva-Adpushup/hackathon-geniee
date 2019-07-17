import React from 'react';
import PropTypes from 'prop-types';

const OnboardingCard = React.forwardRef(
	({ className, isActiveStep, expanded, count, imgPath, heading, description, children }, ref) => (
		<section
			ref={ref}
			className={`onboarding-step${className ? ` ${className}` : ''}${
				isActiveStep ? ' active-step' : ''
			}`}
		>
			<span className="counter-icon">{count}</span>
			<h3 className="ob-heading">{heading}</h3>

			<div className={`card-body-wrap${expanded ? ' expanded' : ''}`}>
				<div className="card-body clearfix">
					<div className="col-md-5 card-img aligner aligner--row aligner--vCenter aligner--hCenter">
						<img src={imgPath} />
					</div>

					<div className="col-md-7 ob-content">
						<p>{description}</p>

						{children}
					</div>
				</div>
			</div>
		</section>
	)
);

OnboardingCard.propTypes = {
	className: PropTypes.string,
	isActiveStep: PropTypes.bool.isRequired,
	expanded: PropTypes.bool.isRequired,
	count: PropTypes.number.isRequired,
	imgPath: PropTypes.string.isRequired,
	heading: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	children: PropTypes.element.isRequired
};

OnboardingCard.defaultProps = {
	className: ''
};

export default OnboardingCard;
