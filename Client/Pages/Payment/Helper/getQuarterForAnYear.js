const numToMonth = [
	'All Months',
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];
const quarterToMonth = {
	1: { start: 'Jan', end: 'Mar' },
	2: { start: 'Apr', end: 'Jun' },
	3: { start: 'Jul', end: 'Sep' },
	4: { start: 'Oct', end: 'Dec' }
};
const getMonthsName = ({ quarter, startQuarter, endQuarter, startMonth, endMonth }) => {
	const { start, end } = quarterToMonth[quarter];
	if (quarter === startQuarter && quarter === endQuarter) {
		return startMonth === endMonth
			? numToMonth[startMonth]
			: `${numToMonth[startMonth]}-${numToMonth[endMonth]}`;
	} else if (quarter === startQuarter) {
		return numToMonth[startMonth] === end
			? numToMonth[startMonth]
			: `${numToMonth[startMonth]}-${end}`;
	} else if (quarter === endQuarter) {
		return numToMonth[endMonth] === start
			? numToMonth[endMonth]
			: `${start}-${numToMonth[endMonth]}`;
	} else {
		return `${start}-${end}`;
	}
};

const getQuarterForAnYear = ({ startQuarter, endQuarter, startMonth, endMonth, year }) => {
	const allQuarter = [];
	for (let quarter = startQuarter; quarter <= endQuarter; quarter++) {
		const monthNames = getMonthsName({ quarter, startQuarter, endQuarter, startMonth, endMonth });
		const name = `Q${quarter}(${monthNames}), ${year}`;
		const value = { quarter, year };
		const quarterValue = {
			name,
			value
		};
		allQuarter.push(quarterValue);
	}
	return allQuarter;
};
export default getQuarterForAnYear;
