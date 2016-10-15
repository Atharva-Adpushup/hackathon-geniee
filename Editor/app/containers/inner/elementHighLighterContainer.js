import { connect } from 'react-redux';
import ElementHighLighter from '../../components/EditorComponents/InnerComponents/elementHighLighter.jsx';

export default connect(
	({ hbBox }) => ({ cords: hbBox })
)(ElementHighLighter);
