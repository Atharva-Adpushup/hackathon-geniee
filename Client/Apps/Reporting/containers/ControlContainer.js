import { connect } from 'react-redux';
import Control from '../components/Control';
import { checkReportTypeGlobal } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const isReportTypeGlobal = checkReportTypeGlobal(ownProps);
	const { isForOps } = ownProps;
	const {
		reports: { account: accountReportMetaData, global: globalReportMetaData }
	} = state.global;
	const reportsMeta =
		isForOps || isReportTypeGlobal ? { ...globalReportMetaData } : { ...accountReportMetaData };
	const {
		data: { filter, metrics, dimension, interval, site }
	} = reportsMeta;

	return {
		filter,
		metrics,
		dimension,
		interval,
		site,
		...ownProps
	};
};

export default connect(mapStateToProps)(Control);
