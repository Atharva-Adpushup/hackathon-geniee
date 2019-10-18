import { connect } from 'react-redux';
import Table from '../components/Table';
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
		data: { metrics, dimension, site }
	} = reportsMeta;

	return {
		metrics,
		dimension,
		site,
		...ownProps
	};
};

export default connect(mapStateToProps)(Table);
