import moment from 'moment';

const HELPER_FUNCTIONS = {
	formatDatetoStore: date => moment(date).format('YYYY-MM-DD'),
	localStrToNum: strNum => {
		const strWithoutDeliminator = strNum.replace(/\D/g, '');
		const num = parseInt(strWithoutDeliminator, 10);
		return num;
	}
};
export default HELPER_FUNCTIONS;
