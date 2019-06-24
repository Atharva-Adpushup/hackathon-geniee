import { connect } from 'react-redux';

import { getAppStatuses } from '../../../actions/siteActions';
import {
	fetchChannelsInfo,
	updateChannelAutoOptimise
} from '../../../actions/apps/opsPanel/pagegroupActions';
import Apps from '../components/Settings/SiteBody/Apps/index';

const mapStateToProps = (state, ownProps) => ({
	...ownProps
});

const mapDispatchToProps = dispatch => ({
	getAppStatuses: siteId => dispatch(getAppStatuses(siteId)),
	fetchChannelsInfo: siteId => dispatch(fetchChannelsInfo(siteId)),
	updateChannelAutoOptimise: (siteId, params) => dispatch(updateChannelAutoOptimise(siteId, params))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Apps);
