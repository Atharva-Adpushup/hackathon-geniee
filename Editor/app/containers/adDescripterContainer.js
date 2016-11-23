import { connect } from 'react-redux';
import AdsDescriptor from 'editMenu/adDescriptor.jsx';
import { updateCss, updateAdCode } from '../actions/adActions';
import { deleteSection } from '../actions/sectionActions';

const mapStateToProps = (state, ownProps) => ({ ...ownProps }),
	mapDispatchToProps = (dispatch) => ({
		deleteSection: (sectionId, variationId, adId) => {
			dispatch(deleteSection(sectionId, variationId, adId));
		},
		updateCss: (adId, css) => {
			dispatch(updateCss(adId, css));
		},
		updateAdCode: (adId, adCode) => {
			dispatch(updateAdCode(adId, adCode));
		}
	});


export default connect(mapStateToProps, mapDispatchToProps)(AdsDescriptor);

