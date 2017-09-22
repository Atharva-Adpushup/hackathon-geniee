import { connect } from 'react-redux';
import contentOverlay from 'components/inner/contentOverlay';

export default connect(({ contentSelector }) => ({ position: contentSelector.position }))(contentOverlay);
