import React, { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { numberWithCommas } from '../helpers/utils';

function EstimatedEarnings(props) {
	let { displayData } = props;
	const {
		yesterday,
		sameDayLastWeek,
		lastSevenDays,
		previousSevenDays,
		lastThirtyDays,
		previousThirtyDays
	} = displayData && displayData.result && displayData.result[0];

	const dayProgress =
		yesterday > 0 && sameDayLastWeek > 0
			? Math.round(((yesterday - sameDayLastWeek) / yesterday) * 10000) / 100
			: 'N/A';
	const weekProgress =
		lastSevenDays > 0 && previousSevenDays > 0
			? Math.round(((lastSevenDays - previousSevenDays) / lastSevenDays) * 10000) / 100
			: 'N/A';
	const monthProgress =
		lastThirtyDays > 0 && previousThirtyDays > 0
			? Math.round(((lastThirtyDays - previousThirtyDays) / lastThirtyDays) * 10000) / 100
			: 'N/A';
	const displayYestarday = numberWithCommas(Math.round(yesterday * 100) / 100);
	const displaySameDayLastWeek = numberWithCommas(Math.round(sameDayLastWeek * 100) / 100);
	const displayLastSevenDays = numberWithCommas(Math.round(lastSevenDays * 100) / 100);
	const displayPreviousSevenDays = numberWithCommas(Math.round(previousSevenDays * 100) / 100);
	const displayLastThirtyDays = numberWithCommas(Math.round(lastThirtyDays * 100) / 100);
	const displayPreviousThirtyDays = numberWithCommas(Math.round(previousThirtyDays * 100) / 100);
	return (
		<div className="aligner u-margin-t4 u-margin-b4">
			<div className="aligner-item text-center">
				<div className="font-small">
					<span>Yestarday</span>
					<span> VS </span>
					<span>Same Day Last Week</span>
				</div>
				<div className="estimatedEarning">
					<span>${displayYestarday}</span>
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
	//}
}

export default EstimatedEarnings;
