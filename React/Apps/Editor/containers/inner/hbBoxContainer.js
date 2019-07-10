import { connect } from 'react-redux';
import HB from 'inner/highlighterBox.jsx';

export default connect(state => ({
	height: state.hbBox.height,
	width: state.hbBox.width,
	left: state.hbBox.left,
	top: state.hbBox.top
}))(HB);
