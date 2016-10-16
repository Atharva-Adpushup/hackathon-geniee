import { connect } from 'react-redux';
import ElementHighLighter from '../../components/inner/elementHighLighter.jsx';

export default connect(
	({ hbBox }) => ({ cords: hbBox })
)(ElementHighLighter);
