import moment from 'moment';
import uuid from 'uuid';
import getQuarterForAnYear from './getQuarterForAnYear';
import { MONTH_NAMES } from '../configs/commonConsts';

// rightTrim is used in the domanize function
const rightTrim = (string, s) => (string ? string.replace(new RegExp(`${s}*$`), '') : '');

const HELPER_FUNCTIONS = {
	formatDatetoStore: date => moment(date).format('YYYY-MM-DD'),
	localStrToNum: strNum => {
		const strWithoutDeliminator = strNum.replace(/\D/g, '');
		const num = parseInt(strWithoutDeliminator, 10);
		return num;
	},
	isUserFromOps: (sites, accountAccessData) => {
		// Here we are getting the accountAccessData from the global store and in its each userObj we are checking
		// if there is siteId of the current user from the sites variable and storing it in the sitesObj and later
		// looping through this obj to check  if any siteid value is false, if so, false is returned from this function

		const sitesObj = {};
		Object.keys(sites).forEach(siteId => {
			sitesObj[siteId] = false;
			accountAccessData.users?.forEach(userObj => {
				if (userObj.siteIds?.includes(siteId)) {
					sitesObj[siteId] = true;
				}
			});
		});

		Object.keys(sitesObj).forEach(siteId => {
			if (sitesObj[siteId] === false) {
				return false;
			}
		});
		return true;
	},
	getQuartersFromDate: (startDate, endDate) => {
		if (!startDate || !endDate) {
			return [];
		}

		let quarters = [];

		let startQuarter = moment(startDate).quarter();
		let endQuarter = moment(endDate).quarter();

		let startMonth = moment(startDate).format('M');
		let endMonth = moment(endDate).format('M');

		let startYear = moment(startDate).format('YYYY');
		let endYear = moment(endDate).format('YYYY');

		for (let year = startYear; year <= endYear; year++) {
			if (year == startYear && year == endYear) {
				const quartersOfCurrYear = getQuarterForAnYear({
					startQuarter,
					endQuarter,
					startMonth,
					endMonth,
					year
				});
				quarters = [...quarters, ...quartersOfCurrYear];
			} else if (year == startYear) {
				const quartersOfCurrYear = getQuarterForAnYear({
					startQuarter,
					endQuarter: 4,
					startMonth,
					endMonth: 12,
					year
				});
				quarters = [...quarters, ...quartersOfCurrYear];
			} else if (year == endYear) {
				const quartersOfCurrYear = getQuarterForAnYear({
					startQuarter: 1,
					endQuarter,
					startMonth: 1,
					endMonth,
					year
				});
				quarters = [...quarters, ...quartersOfCurrYear];
			} else {
				const quartersOfCurrYear = getQuarterForAnYear({
					startQuarter: 1,
					endQuarter: 4,
					startMonth: 1,
					endMonth: 12,
					year
				});
				quarters = [...quarters, ...quartersOfCurrYear];
			}
		}
		return quarters;
	},
	getMonthsInBetween: (startDate, endDate) => {
		let dates = [startDate, endDate];
		let diff = dates.map(function(date) {
			let momentDate = moment(date);

			return {
				month: momentDate.month(),
				year: momentDate.year()
			};
		});

		let start = Object.assign({}, diff[0]),
			end = Object.assign({}, diff[diff.length - 1]);

		// If start month and year is same as end month then return the same month
		if (start.month === end.month && start.year === end.year) {
			var resArr = [MONTH_NAMES[start.month] + ' ' + start.year];
			return resArr;
		}

		let months = [];
		if (end.year >= start.year) {
			//Run this loop until start month and year are less than end month and year
			while (start.month < end.month || start.year < end.year) {
				if (start.month < 11) {
					var monthFormatToCheck = MONTH_NAMES[start.month] + ' ' + start.year; // Currently we are getting month in the form of July ,2023
					if (!months.includes(monthFormatToCheck)) {
						months.push(monthFormatToCheck);
					}
					start.month++;
				} else {
					start.month = 0;
					start.year++;
				}
				// Currently we are getting month in the form of July ,2023
				months.push(MONTH_NAMES[start.month] + ' ' + start.year);
			}
		}
		return months;
	},
	findQuarterByName: (dealName, selectedQuarters) => {
		const quarter = selectedQuarters.find(({ name }) => name == dealName);
		return quarter;
	},
	findQuarterByValue: (deal, selectedQuarters) => {
		const quarter = selectedQuarters.find(
			({ value }) =>
				value && value.quarter && value.quarter == deal.quarter && value.year == deal.year
		);
		return quarter;
	},
	findMonthByValue: (deal, selectedMonths) => {
		let monthToReturn;
		selectedMonths.forEach(month => {
			if (
				month.includes(
					moment()
						.month(deal.month - 1)
						.format('MMM')
				) &&
				month.includes(deal.year.toString())
			) {
				monthToReturn = month;
			}
		});
		return monthToReturn;
	},
	createDealObject: ({ site, monthToValue, mgType, allDeals, startDate, endDate, siteId }) => {
		const monthWiseData = Object.keys(monthToValue).map(key => {
			const month = Number(
				moment()
					.month(key.split(' ')[0])
					.format('M')
			);
			const year = Number(key.split(' ')[1]);
			const currentMonthData = {
				month,
				year,
				mgValue: Number(monthToValue[key])
			};
			return currentMonthData;
		});

		const deal = {
			id: uuid.v4(),
			isActive: true,
			mgType,
			siteId,
			siteDomain: site,
			startDate: moment(startDate.valueOf()),
			endDate: moment(endDate.valueOf()),
			createdDate: moment().valueOf(),
			lastModifiedDate: moment().valueOf(),
			dealValues: monthWiseData
		};
		return deal;
	},
	getDealEditObject: ({ site, mgInput, mgType, selectedDeal, startDate, endDate, siteId }) => {
		const monthDataArr = [];
		selectedDeal.dealValues.forEach((deal, index) => {
			Object.keys(mgInput).forEach(key => {
				const month = Number(
					moment()
						.month(key.split(' ')[0])
						.format('M')
				);
				const year = Number(key.split(' ')[1]);
				if (deal.month == month && deal.year == year) {
					selectedDeal.dealValues.splice(index, 1);
				}
			});
		});
		Object.keys(mgInput).forEach(key => {
			const month = Number(
				moment()
					.month(key.split(' ')[0])
					.format('M')
			);
			const year = Number(key.split(' ')[1]);
			const currentMonthData = {
				month,
				year,
				mgValue: Number(mgInput[key])
			};
			monthDataArr.push(currentMonthData);
		});

		const newDeal = {
			id: selectedDeal.id,
			isActive: true,
			mgType,
			siteId,
			siteDomain: site,
			startDate: moment(startDate).valueOf(),
			endDate: moment(endDate).valueOf(),
			createdDate: selectedDeal.createdDate,
			lastModifiedDate: moment().valueOf(),
			dealValues: [...selectedDeal.dealValues, ...monthDataArr]
		};
		return newDeal;
	}
};
export default HELPER_FUNCTIONS;
