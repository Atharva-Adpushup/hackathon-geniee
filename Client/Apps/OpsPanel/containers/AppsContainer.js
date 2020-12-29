import { connect } from 'react-redux';

import {
	getAppStatuses,
	updateSiteAutoOptimise,
	updateAppStatus,
	updateSite,
	saveSettings
} from '../../../actions/siteActions';
import {
	fetchChannelsInfo,
	updateChannelAutoOptimise
} from '../../../actions/apps/opsPanel/pagegroupActions';
import {
	fetchAllBiddersAction,
	updateBidderAction
} from '../../../actions/apps/headerBidding/hbActions';
import Apps from '../components/Settings/SiteBody/Apps/index';

const mapStateToProps = (state, ownProps) => {
	const { headerBidding } = state.apps;
	const {
		site: { siteId }
	} = ownProps;
	const siteData = headerBidding[siteId] || {};
	const { bidders: { addedBidders = null } = {} } = siteData;

	return {
		...ownProps,
		bidders: addedBidders
	};
};

const mapDispatchToProps = dispatch => ({
	getAppStatuses: siteId => dispatch(getAppStatuses(siteId)),
	fetchChannelsInfo: siteId => dispatch(fetchChannelsInfo(siteId)),
	updateChannelAutoOptimise: (siteId, params, dataForAuditLogs) =>
		dispatch(updateChannelAutoOptimise(siteId, params, dataForAuditLogs)),
	updateSiteAutoOptimise: (siteId, params, dataForAuditLogs) =>
		dispatch(updateSiteAutoOptimise(siteId, params, dataForAuditLogs)),
	updateAppStatus: (siteId, params, dataForAuditLogs) =>
		dispatch(updateAppStatus(siteId, params, dataForAuditLogs)),
	updateSite: (siteId, params, dataForAuditLogs) =>
		dispatch(updateSite(siteId, params, dataForAuditLogs)),
	fetchAllBiddersAction: siteId => dispatch(fetchAllBiddersAction(siteId)),
	updateBidderAction: (siteId, data, params = {}, dataForAuditLogs) =>
		dispatch(updateBidderAction(siteId, data, params, dataForAuditLogs)),
	saveSettings: (siteId, siteData, dataForAuditLogs) =>
		dispatch(saveSettings(siteId, siteData, dataForAuditLogs))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Apps);
