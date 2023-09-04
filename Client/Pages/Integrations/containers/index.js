import { connect } from 'react-redux';
import Integrations from '../components/index';
import { updateAdNetworkSettingsAction } from '../../../actions/userActions';
import { showNotification } from '../../../actions/uiActions';

const mapStateToProps = (state, ownProps) => {
	const {
		user: { data: user }
	} = state.global;

	return {
		user,
		...ownProps
	};
};

const mapDispatchToProps = dispatch => ({
	updateAdNetworkSettings: data => dispatch(updateAdNetworkSettingsAction(data)),
	showNotification: data => dispatch(showNotification(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Integrations);
