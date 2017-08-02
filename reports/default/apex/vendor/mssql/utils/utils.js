const moment = require('moment');

//TODO: Add date format 'YYYY-MM-DD' validation on input parameters and 
// check whether this function is an effective utility or not
// NOTE: Make hard coded date range parameterised to make it a utility function
const getSqlValidParameterDates = function(params) {
	if (!params || !params.dateFrom || !params.dateTo) { return {}; }

	// The below 'fromDate' has hard coded value because our sql production database has data
	// starting from this date.
	// NOTE: This variable value is subject to change as our production database gets stable.
	var fromDate = '2017-07-26',
		todayDate = moment().format('YYYY-MM-DD'),

		inputFromDate = params.dateFrom,
		isInputFromDateInRange = !!((moment(fromDate).isBefore(inputFromDate) && moment(todayDate).isAfter(inputFromDate))),
		isInputFromDateEqualsAnyDateRange = !!(moment(fromDate).isSame(inputFromDate) || moment(todayDate).isSame(inputFromDate)),
		isValidInputFromDate = !!(isInputFromDateInRange || isInputFromDateEqualsAnyDateRange),

		inputToDate = params.dateTo,
		isInputToDateInRange = !!(moment(fromDate).isBefore(inputToDate) && moment(todayDate).isAfter(inputToDate)),
		isInputToDateEqualsFromDate = !!(moment(fromDate).isSame(inputToDate)),
		isInputToDateEqualsToDate = !!(moment(todayDate).isSame(inputToDate)),
		isInputToDateComparison = !!(moment(inputToDate).isAfter(inputFromDate) || moment(inputToDate).isSame(inputFromDate)),
		isValidInputToDate = !!((isInputToDateInRange && isInputToDateComparison) || (isInputToDateComparison && isInputToDateEqualsFromDate) || (isInputToDateComparison && isInputToDateEqualsToDate));
	console.log(`${isValidInputFromDate}, ${isValidInputToDate}`);

	params.dateFrom = (isValidInputFromDate) ? inputFromDate: fromDate;
	params.dateTo = (isValidInputToDate) ? inputToDate: todayDate;

	return params;
};

module.exports = { getSqlValidParameterDates };
