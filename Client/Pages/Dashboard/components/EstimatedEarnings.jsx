import React, { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { numberWithCommas, roundOffTwoDecimal } from '../helpers/utils';

function EstimatedEarnings(props) {
	const { displayData } = props;

	// let yesterday = 0;
	let sameDayLastWeek = 0;
	let lastSevenDays = 0;
	let previousSevenDays = 0;
	let lastThirtyDays = 0;
	let previousThirtyDays = 0;

	if (displayData && displayData.result && displayData.result.length > 0) {
		const overAlData = displayData.result[0];
		yesterday = overAlData.yesterday;
		sameDayLastWeek = overAlData.sameDayLastWeek;
		lastSevenDays = overAlData.lastSevenDays;
		previousSevenDays = overAlData.previousSevenDays;
		lastThirtyDays = overAlData.lastThirtyDays;
		previousThirtyDays = overAlData.previousThirtyDays;
	}

	const dayProgress =
		yesterday > 0 && sameDayLastWeek > 0
			? roundOffTwoDecimal(((yesterday - sameDayLastWeek) / sameDayLastWeek) * 100)
			: 'N/A';
	const weekProgress =
		lastSevenDays > 0 && previousSevenDays > 0
			? roundOffTwoDecimal(((lastSevenDays - previousSevenDays) / previousSevenDays) * 100)
			: 'N/A';
	const monthProgress =
		lastThirtyDays > 0 && previousThirtyDays > 0
			? roundOffTwoDecimal(((lastThirtyDays - previousThirtyDays) / previousThirtyDays) * 100)
			: 'N/A';
	const displayYesterday = numberWithCommas(roundOffTwoDecimal(yesterday));
	const displaySameDayLastWeek = numberWithCommas(roundOffTwoDecimal(sameDayLastWeek));
	const displayLastSevenDays = numberWithCommas(roundOffTwoDecimal(lastSevenDays));
	const displayPreviousSevenDays = numberWithCommas(roundOffTwoDecimal(previousSevenDays));
	const displayLastThirtyDays = numberWithCommas(roundOffTwoDecimal(lastThirtyDays));
	const displayPreviousThirtyDays = numberWithCommas(roundOffTwoDecimal(previousThirtyDays));
	return (
		<div className="aligner u-margin-t4 u-margin-b4">
			<div className="aligner-item text-center">
				<div className="font-small">
					<span>Yesterday</span>
					<span> VS </span>
					<span>Same Day Last Week</span>
				</div>
				<div className="estimatedEarning">
					<span>${displayYesterday}</span>
					<span> / </span>
					<span>${displaySameDayLastWeek}</span>
				</div>
				<div>
					(
					{dayProgress == 'N/A' ? (
						<span>N/A</span>
					) : (
						<Fragment>
							<span>{dayProgress}% </span>
							<FontAwesomeIcon icon={dayProgress > 0 ? 'arrow-up' : 'arrow-down'} />
						</Fragment>
					)}
					)
				</div>
			</div>
			<div className="aligner-item text-center">
				<div className="font-small">
					<span>Last 7 days</span>
					<span> VS </span>
					<span>Previous 7 days</span>
				</div>
				<div className="estimatedEarning">
					<span>${displayLastSevenDays}</span>
					<span> / </span>
					<span>${displayPreviousSevenDays}</span>
				</div>
				<div>
					(
					{weekProgress == 'N/A' ? (
						<span>N/A</span>
					) : (
						<Fragment>
							<span>{weekProgress}% </span>
							<FontAwesomeIcon icon={weekProgress > 0 ? 'arrow-up' : 'arrow-down'} />
						</Fragment>
					)}
					)
				</div>
			</div>
			<div className="aligner-item text-center">
				<div className="font-small">
					<span>Last 30 days</span>
					<span> VS </span>
					<span>Previous 30 days</span>
				</div>

				<div className="estimatedEarning">
					<span>${displayLastThirtyDays}</span>
					<span> / </span>
					<span>${displayPreviousThirtyDays}</span>
				</div>
				<div>
					(
					{monthProgress == 'N/A' ? (
						<span>N/A</span>
					) : (
						<Fragment>
							<span>{monthProgress}% </span>
							<FontAwesomeIcon icon={monthProgress > 0 ? 'arrow-up' : 'arrow-down'} />
						</Fragment>
					)}
					)
				</div>
			</div>
		</div>
	);
}

export default EstimatedEarnings;
