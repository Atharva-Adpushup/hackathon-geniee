import { connect } from 'react-redux';
import QuickSnapshot from '../components/quickSnapshot';

const mapStateToProps = (state, ownProps) => {
	const {
		reports: {
			data: { widget, site }
		}
	} = state.global;
	return {
		...ownProps,
		widget,
		site
	};
};

export default connect(
	mapStateToProps,
	null
)(QuickSnapshot);
