import { connect } from 'react-redux';
import AdsTxtStatus from '../components/AdsTxtStatus';
import { checkReportTypeGlobal } from '../../../helpers/commonFunctions';

const mapStateToProps = (state, ownProps) => {
	const isReportTypeGlobal = checkReportTypeGlobal(ownProps);
	const {
		reports: { account: accountReportMetaData, global: globalReportMetaData },
		sites
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
		site,
		userSites: sites.fetched ? sites.data : {}
	};
};

export default connect(mapStateToProps)(AdsTxtStatus);
