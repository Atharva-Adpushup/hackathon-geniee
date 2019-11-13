import { connect } from 'react-redux';
import Chart from '../components/Chart';
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
		data: { filter, metrics, dimension, site }
	} = reportsMeta;

	return {
		filter,
		metrics,
		dimension,
		site,
		...ownProps
	};
};

export default connect(mapStateToProps)(Chart);
