import { connect } from 'react-redux';
import ReportsPanelSettings from '../components/Settings/SiteBody/ReportsPanelSettings';
import { showNotification } from '../../../actions/uiActions';
import { updateUser, fetchPeerPerformanceBlockedSite } from '../../../actions/userActions';
import { updateGlobalReportMetaData } from '../../../actions/globalActions';

const mapStateToProps = (state, ownProps) => {
	const { user, reports: { global } = {} } = state.global;
	const {
		data: {
			peerPerformanceBlockedSites: {
				fetched: peerPerformanceBlockedSitesFetched = false,
				value: peerPerformanceBlockedSites = []
			} = {}
		} = {}
	} = user;
	const {
		fetched: globalDataFetched = false,
		data: { site: allActiveSites = {} }
	} = global;
	return {
		fetched: user.fetched,
		user: user.data,
		global,
		...ownProps,
		peerPerformanceBlockedSites,
		peerPerformanceBlockedSitesFetched,
		globalDataFetched,
		allActiveSites
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data)),
	updateUser: (data, dataForAuditLogs) => dispatch(updateUser(data, dataForAuditLogs)),
	updateGlobalReportMetaData: params => dispatch(updateGlobalReportMetaData(params)),
	fetchPeerPerformanceBlockedSite: () => dispatch(fetchPeerPerformanceBlockedSite())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ReportsPanelSettings);
