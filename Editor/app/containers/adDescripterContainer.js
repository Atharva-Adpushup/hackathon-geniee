import { connect } from 'react-redux';
import AdsDescriptor from 'editMenu/adDescriptor.jsx';
import { updateCss, updateAdCode, updateNetwork } from '../actions/adActions';
import { deleteSection } from '../actions/sectionActions';

const mapStateToProps = (state, ownProps) => ({ ...ownProps }),
	mapDispatchToProps = (dispatch) => ({
		deleteSection: (sectionId, variationId, adId) => {
			dispatch(deleteSection(sectionId, variationId, adId));
		},
		updateCss: (adId, css) => {
			dispatch(updateCss(adId, css));
		},
		updateAdCode: (adId, adCode, network) => {
			dispatch(updateAdCode(adId, adCode, network));
		},
		updateNetwork: (adId, priceFloor, network) => {
			dispatch(updateNetwork(adId, priceFloor, network));
		}
	});


export default connect(mapStateToProps, mapDispatchToProps)(AdsDescriptor);

