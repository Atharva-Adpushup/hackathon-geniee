import { connect } from 'react-redux';
import MixPanelAnalytics from '../Components/UserAnalytics/MixpanelAnalytics';

const mapStateToProps = (state, ownProps) => {
	const {
		global: { user }
	} = state;

	return { user: user.data, ...ownProps };
};

export default connect(mapStateToProps)(MixPanelAnalytics);
