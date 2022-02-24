import { connect } from 'react-redux';
import SiteSettings from '../components/index';
import { updateApConfig, updateBlocklistedLineItems } from '../../../actions/siteActions';
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
	showNotification: config => dispatch(showNotification(config)),
	updateBlocklistedLineItems: (siteId, blockListedLineItems) =>
		dispatch(updateBlocklistedLineItems(siteId, blockListedLineItems))
});

export default connect(mapStateToProps, mapDispatchToProps)(SiteSettings);
