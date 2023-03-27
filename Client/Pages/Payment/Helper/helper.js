import moment from 'moment';
import getQuarterForAnYear from './getQuarterForAnYear';

const HELPER_FUNCTIONS = {
	formatDatetoStore: date => moment(date).format('YYYY-MM-DD'),
	localStrToNum: strNum => {
		const strWithoutDeliminator = strNum.replace(/\D/g, '');
		const num = parseInt(strWithoutDeliminator, 10);
		return num;
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
	createDealObject: ({
		quarterToValue,
		mgType,
		allDeals,
		startDate,
		endDate,
		selectedQuarters
	}) => {
		const { findQuarterByName } = HELPER_FUNCTIONS;
		const quarterWiseData = Object.keys(quarterToValue).map(key => {
			const currentQuarter = findQuarterByName(key, selectedQuarters);
			const {
				value: { quarter, year }
			} = currentQuarter;
			const currQuarterData = {
				quarter,
				year,
				value: quarterToValue[key]
			};
			return currQuarterData;
		});

		const deal = {
			id: allDeals.length + 1,
			isActive: true,
			mgType: mgType,
			startDate: moment(startDate).valueOf(),
			endDate: moment(endDate).valueOf(),
			createdDate: moment().valueOf(),
			lastModifiedDate: moment().valueOf(),
			quarterWiseData
		};
		return deal;
	},
	getDealEditObject: ({
		quarterToValue,
		mgType,
		selectedDeal,
		startDate,
		endDate,
		selectedQuarters
	}) => {
		const { findQuarterByName } = HELPER_FUNCTIONS;
		const quarterWiseData = Object.keys(quarterToValue).map(key => {
			const currVal = findQuarterByName(key, selectedQuarters);
			return {
				quarter: currVal.value.quarter,
				year: currVal.value.year,
				value: quarterToValue[key]
			};
		});

		const newDeal = {
			id: selectedDeal.id,
			isActive: true,
			mgType: mgType,
			startDate: moment(startDate).valueOf(),
			endDate: moment(endDate).valueOf(),
			createdDate: selectedDeal.createdDate,
			lastModifiedDate: moment().valueOf(),
			quarterWiseData
		};
		return newDeal;
	}
};
export default HELPER_FUNCTIONS;
