import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AdsDescriptor from 'contextMenu/editMenu/adDescriptor.jsx';
import * as adActions from '../actions/adActions';


const mapStateToProps = (state, ownProps) => ({ ...ownProps }),
	mapDispatchToProps = (dispatch) => bindActionCreators(adActions, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(AdsDescriptor);

