import { connect } from 'react-redux';
import Pagegroup from '../components/Settings/SiteBody/Pagegroups/index';
import {
	createChannels,
	fetchChannelsInfo,
	updatePagegroupPattern,
	deletePagegroup
} from '../../../actions/apps/opsPanel/pagegroupActions';

const mapStateToProps = (state, ownProps) => ({
	...ownProps
});

const mapDispatchToProps = dispatch => ({
	createChannels: (siteId, data, dataForAuditLogs) =>
		dispatch(createChannels(siteId, data, dataForAuditLogs)),
	fetchChannelsInfo: siteId => dispatch(fetchChannelsInfo(siteId)),
	updatePagegroupPattern: (siteId, data, dataForAuditLogs) =>
		dispatch(updatePagegroupPattern(siteId, data, dataForAuditLogs)),
	deletePagegroup: (siteId, params, dataForAuditLogs) =>
		dispatch(deletePagegroup(siteId, params, dataForAuditLogs))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Pagegroup);
