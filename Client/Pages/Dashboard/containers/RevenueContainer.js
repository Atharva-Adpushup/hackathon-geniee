import { connect } from 'react-redux';
import Revenue from '../components/Revenue';
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
		data: { site, metrics, filter }
	} = reportsMeta;

	return {
		...ownProps,
		site,
		metrics,
		filter
	};
};

export default connect(mapStateToProps)(Revenue);
