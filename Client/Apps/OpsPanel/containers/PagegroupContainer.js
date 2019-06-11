import { connect } from 'react-redux';
import Pagegroup from '../components/Settings/SiteBody/Pagegroups/index';
import { createChannels, fetchChannelsInfo } from '../../../actions/apps/opsPanel/pagegroupActions';

const mapStateToProps = (state, ownProps) => ({
	...ownProps
});

const mapDispatchToProps = dispatch => ({
	createChannels: (siteId, data) => dispatch(createChannels(siteId, data)),
	fetchChannelsInfo: siteId => dispatch(fetchChannelsInfo(siteId))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Pagegroup);
