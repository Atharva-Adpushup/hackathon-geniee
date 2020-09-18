import { connect } from 'react-redux';

import { showNotification } from '../../../actions/uiActions';
import { updateNetworkConfig } from '../../../actions/globalActions';
import Tools from '../components/Tools/index';

const mapStateToProps = (state, ownProps) => {
	const { sites, networkConfig, user } = state.global;
	return {
		fetched: sites.fetched && networkConfig.fetched,
		sites: sites.data,
		networkConfig: networkConfig.data,
		user: user.data,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	showNotification: data => dispatch(showNotification(data)),
	updateNetworkConfig: config => dispatch(updateNetworkConfig(config))
});

export default connect(mapStateToProps, mapDispatchToProps)(Tools);
