import { connect } from 'react-redux';
import { UTM_METRICS } from '../../configs/commonConsts';
import Table from '../../components/URLAndUTMReporting/Table';

const mapStateToProps = (state, ownProps) => {
	const {
		urlreport: { global: globalReportMetaData }
	} = state.global;

	const urlUTMReportingMeta = globalReportMetaData;
	const {
		data: { dimension, site }
	} = urlUTMReportingMeta;

	return {
		metrics: UTM_METRICS,
		dimension,
		site,
		...ownProps,
		isURLReport: true
	};
};

export default connect(mapStateToProps)(Table);
