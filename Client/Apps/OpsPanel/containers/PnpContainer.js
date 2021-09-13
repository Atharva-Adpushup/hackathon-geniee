import { connect } from 'react-redux';
import PnP from '../components/Settings/SiteBody/PnP';
import { updatePnpConfig, updatePnpConfigKey } from '../../../actions/apps/pnp/pnpActions';

const mapStateToProps = (state, ownProps) => {
	const {
		apps: { pnp: pnpConfig }
	} = state;
	return {
		...ownProps,
		pnpConfig
	};
};

const mapDispatchToProps = dispatch => ({
	updatePnPConfig: (siteId, config) => dispatch(updatePnpConfig(siteId, config)),
	updatePnPConfigKey: (siteId, key, value) => dispatch(updatePnpConfigKey(siteId, key, value))
});

export default connect(mapStateToProps, mapDispatchToProps)(PnP);
