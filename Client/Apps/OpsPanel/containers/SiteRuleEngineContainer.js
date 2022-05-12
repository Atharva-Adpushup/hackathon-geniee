import { connect } from 'react-redux';

import SitesRulesEngine from '../components/Settings/SiteBody/SitesRulesEngine';
import { showNotification } from '../../../actions/uiActions';
import { saveSiteRulesEngine, setUnsavedChangesAction } from '../../../actions/siteActions';

const mapStateToProps = (state, ownProps) => {
	const {
		site: { siteId }
	} = ownProps;

	const {
		apps: {
			headerBidding: { sites: hbSiteData }
		}
	} = state;

	const currSiteHbData = (hbSiteData && hbSiteData[siteId]) || {};
	const { inventories = [] } = currSiteHbData;
	return {
		...ownProps,
		inventories
	};
};

const mapDispatchToProps = {
	saveSiteRulesEngine,
	showNotification,
	setUnsavedChangesAction
};

export default connect(mapStateToProps, mapDispatchToProps)(SitesRulesEngine);
