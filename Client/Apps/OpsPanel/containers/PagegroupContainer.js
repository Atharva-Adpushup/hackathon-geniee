import { connect } from 'react-redux';
import Pagegroup from '../components/Settings/SiteBody/Pagegroup';
import { createPagegroups } from '../../../actions/apps/opsPanel/settingsActions';

const mapStateToProps = (state, ownProps) => ({
	...ownProps
});

const mapDispatchToProps = dispatch => ({
	createPagegroups: (siteId, data) => dispatch(createPagegroups(siteId, data))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Pagegroup);
