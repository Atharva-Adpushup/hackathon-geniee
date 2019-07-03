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
	updateChannelAutoOptimise: (siteId, params) =>
		dispatch(updateChannelAutoOptimise(siteId, params)),
	updateSiteAutoOptimise: (siteId, params) => dispatch(updateSiteAutoOptimise(siteId, params)),
	updateAppStatus: (siteId, params) => dispatch(updateAppStatus(siteId, params)),
	updateSite: (siteId, params) => dispatch(updateSite(siteId, params)),
	fetchAllBiddersAction: siteId => dispatch(fetchAllBiddersAction(siteId)),
	updateBidderAction: (siteId, data, params = {}) =>
		dispatch(updateBidderAction(siteId, data, params)),
	saveSettings: (siteId, siteData) => dispatch(saveSettings(siteId, siteData))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Apps);
