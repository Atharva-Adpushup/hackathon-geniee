import { connect } from 'react-redux';
import PerformanceOverview from '../components/PerformanceOverview';
import { checkReportTypeGlobal } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const isReportTypeGlobal = checkReportTypeGlobal(ownProps);
	const {
		reports: { account: accountReportMetaData, global: globalReportMetaData }
	} = state.global;
	const reportsMeta = isReportTypeGlobal
		? { ...globalReportMetaData }
		: { ...accountReportMetaData };
	const {
		data: { site, metrics }
	} = reportsMeta;

	return {
		...ownProps,
		metrics,
		site
	};
};

export default connect(mapStateToProps)(PerformanceOverview);
