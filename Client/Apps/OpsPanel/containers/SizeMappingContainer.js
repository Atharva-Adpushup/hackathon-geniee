import { connect } from 'react-redux';

import SizeMapping from '../components/SizeMapping';
import { showNotification } from '../../../actions/uiActions';
import { updateSizeMapping } from '../../../actions/apps/opsPanel/sizeMapping';
import { fetchSiteInventories, resetSiteInventories } from '../../../actions/siteActions';

const mapStateToProps = (state, ownProps) => {
	const {
		site: { siteId }
	} = ownProps;
	const {
		sites: {
			data: { [siteId]: siteData = {} }
		}
	} = state.global;

	const { inventories = [] } = siteData;

	return {
		...ownProps,
		inventories
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data)),
	fetchSiteInventories: siteId => dispatch(fetchSiteInventories(siteId)),
	resetSiteInventories: siteId => dispatch(resetSiteInventories(siteId)),
	updateSizeMapping: (siteId, sizeMapping, dataForAuditLogs) =>
		dispatch(updateSizeMapping(siteId, sizeMapping, dataForAuditLogs))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SizeMapping);
