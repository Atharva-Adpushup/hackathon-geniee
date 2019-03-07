import { connect } from 'react-redux';
import SiteSettings from '../components/index';

const mapStateToProps = (state, ownProps) => {
	const {
		sites: { data }
	} = state.global;

	return {
		sites: data,
		...ownProps
	};
};

const mapDispatchToProps = () => ({});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SiteSettings);
