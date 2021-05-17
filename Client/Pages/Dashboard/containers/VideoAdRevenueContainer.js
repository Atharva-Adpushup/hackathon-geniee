import { connect } from 'react-redux';
import VideoAdRevenue from '../components/VideoAdRevenue';
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

export default connect(mapStateToProps)(VideoAdRevenue);
