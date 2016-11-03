import { connect } from 'react-redux';
import AdsDescriptor from 'editMenu/adDescriptor.jsx';
import { updateCss, deleteAd } from '../actions/adActions';
import { deleteSection } from '../actions/sectionActions';

const mapStateToProps = (state, ownProps) => ({ ...ownProps }),
	mapDispatchToProps = (dispatch) => ({
		deleteSection: (sectionId, variationId) => {
			dispatch(deleteSection(sectionId, variationId));
		},
		deleteAd: (adId, sectionId) => {
			dispatch(deleteAd(adId, sectionId));
		},
		updateCss: (adId, css) => {
			dispatch(updateCss(adId, css));
		}
	});


export default connect(mapStateToProps, mapDispatchToProps)(AdsDescriptor);

