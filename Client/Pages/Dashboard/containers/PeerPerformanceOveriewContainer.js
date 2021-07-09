import { connect } from 'react-redux';
import PeerPerformanceOverview from '../components/PeerPerformanceOverview';
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
	const {
		displayData: {
			data: {
				peer_performance_report: peerPerformanceReport = {},
				revenue_channel_report: revenueChannelData = {}
			} = {},
			chartLegend = '',
			chartSeriesLabel = '',
			chartSeriesMetric = '',
			chartSeriesMetricType = ''
		} = {}
	} = ownProps;
	return {
		...ownProps,
		metrics,
		site,
		peerPerformanceReport,
		revenueChannelData,
		chartLegend,
		chartSeriesLabel,
		chartSeriesMetric,
		chartSeriesMetricType
	};
};

export default connect(mapStateToProps)(PeerPerformanceOverview);
