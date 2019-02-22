import React from 'react';
import PropTypes from 'prop-types';

const OnboardingCard = ({ isActiveStep, count, imgPath, heading, description, children }) => (
	<section className={`onboarding-step${isActiveStep ? ' active-step' : ''}`}>
		<span className="counter-icon">{count}</span>
		<div className="col-md-5 card-img aligner aligner--row aligner--vCenter aligner--hCenter">
			<img src={imgPath} />
		</div>

		<div className="col-md-7 ob-content">
			<h3 className="ob-heading">{heading}</h3>
			<p>{description}</p>

			{children}
		</div>
	</section>
);

OnboardingCard.propTypes = {
	isActiveStep: PropTypes.bool.isRequired,
	count: PropTypes.number.isRequired,
	imgPath: PropTypes.string.isRequired,
	heading: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	children: PropTypes.element.isRequired
};

export default OnboardingCard;
