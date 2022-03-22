import { connect } from 'react-redux';
import PerformanceOverview from '../components/PerformanceOverview';
import { checkReportTypeGlobal } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const isReportTypeGlobal = checkReportTypeGlobal(ownProps);
	const {
		reports: { account: accountReportMetaData, global: globalReportMetaData },
		user
	} = state.global;
	const {
		data: { allowGrossRevenue }
	} = user;

	const reportsMeta = isReportTypeGlobal
		? { ...globalReportMetaData }
		: { ...accountReportMetaData };
	const {
		data: { site, metrics }
	} = reportsMeta;

	return {
		...ownProps,
		metrics,
		site,
		allowGrossRevenue
	};
};

export default connect(mapStateToProps)(PerformanceOverview);
