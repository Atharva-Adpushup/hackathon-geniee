import { connect } from 'react-redux';
import SiteSettings from '../components/index';
import { updateApConfig } from '../../../actions/siteActions';
import { showNotification } from '../../../actions/uiActions';

const mapStateToProps = (state, ownProps) => {
	const {
		sites: { data }
	} = state.global;

	return {
		sites: data,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	updateApConfig: (siteId, apConfigs) => dispatch(updateApConfig(siteId, apConfigs)),
	showNotification: config => dispatch(showNotification(config))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SiteSettings);
