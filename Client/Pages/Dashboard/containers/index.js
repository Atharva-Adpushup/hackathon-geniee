import { connect } from 'react-redux';
import Dashboard from '../components/index';
import { showNotification } from '../../../actions/uiActions';
import { updateAccountReportMetaData } from '../../../actions/globalActions';
import { fetchPeerPerformanceBlockedSite } from '../../../actions/userActions';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: { account: accountReportMetaData },
		user,
		sites
	} = state.global;
	const {
		data: {
			peerPerformanceBlockedSites: {
				value: peerPerformanceblockedSites = [],
				fetched: peerPerformanceBlockedSitesFetched = false
			} = {},
			peerPerformanceAnalysis,
			peerPerformanceAnalysisSites = [],
			activeProducts = {}
		}
	} = user;
	return {
		...ownProps,
		reportsMeta: accountReportMetaData,
		// widget: reportingData.widget || {},
		user,
		// reportingSites: reportingData.site || {},
		sites: sites.fetched ? sites.data : {},
		reportType: ownProps.reportType || 'account',
		peerPerformanceblockedSites,
		peerPerformanceBlockedSitesFetched,
		peerPerformanceAnalysis,
		peerPerformanceAnalysisSites,
		activeProducts
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data)),
	updateAccountReportMetaData: params => dispatch(updateAccountReportMetaData(params)),
	fetchPeerPerformanceBlockedSite: () => dispatch(fetchPeerPerformanceBlockedSite())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Dashboard);
