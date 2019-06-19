import { connect } from 'react-redux';
import Pagegroup from '../components/Settings/SiteBody/Pagegroups/index';
import {
	createChannels,
	fetchChannelsInfo,
	updatePagegroupPattern
} from '../../../actions/apps/opsPanel/pagegroupActions';

const mapStateToProps = (state, ownProps) => ({
	...ownProps
});

const mapDispatchToProps = dispatch => ({
	createChannels: (siteId, data) => dispatch(createChannels(siteId, data)),
	fetchChannelsInfo: siteId => dispatch(fetchChannelsInfo(siteId)),
	updatePagegroupPattern: (siteId, data) => dispatch(updatePagegroupPattern(siteId, data))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Pagegroup);
