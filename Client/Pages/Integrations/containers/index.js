import { connect } from 'react-redux';
import Integrations from '../components/index';
import { updateAdNetworkSettingsAction } from '../../../actions/userActions';

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
	updateAdNetworkSettings: data => dispatch(updateAdNetworkSettingsAction(data))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Integrations);
