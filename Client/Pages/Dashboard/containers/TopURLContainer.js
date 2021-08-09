import { connect } from 'react-redux';
import TopURLReport from '../components/TopURLReport';
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
		data: { metrics, site }
	} = reportsMeta;

	return {
		...ownProps,
		metrics,
		site
	};
};

export default connect(mapStateToProps)(TopURLReport);
