import { connect } from 'react-redux';

import { showNotification } from '../../../actions/uiActions';
import { updateNetworkConfig, saveNetworkWideRules } from '../../../actions/globalActions';
import { setUnsavedChangesAction } from '../../../actions/apps/headerBidding/hbActions';
import Tools from '../components/Tools/index';

const mapStateToProps = (state, ownProps) => {
	const { sites, networkConfig, user, networkWideRules } = state.global;

	const networkConfigData = networkConfig.data;
	const updatedNetworkConfig = {};

	// eslint-disable-next-line no-restricted-syntax
	for (const bidder in networkConfigData) {
		if (networkConfigData[bidder].isHb) {
			updatedNetworkConfig[bidder] = {
				...updatedNetworkConfig[bidder],
				...networkConfigData[bidder]
			};
		}
	}

	return {
		fetched: sites.fetched && networkConfig.fetched,
		sites: sites.data,
		networkConfig: updatedNetworkConfig,
		user: user.data,
		rules: networkWideRules.data,
		...ownProps
	};
};

export default connect(
	mapStateToProps,
	{
		showNotification,
		updateNetworkConfig,
		saveNetworkWideRules,
		setUnsavedChangesAction
	}
)(Tools);
