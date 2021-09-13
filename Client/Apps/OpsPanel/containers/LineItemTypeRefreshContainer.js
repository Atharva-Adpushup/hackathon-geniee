import { connect } from 'react-redux';
import LineItemTypeRefresh from '../components/Settings/SiteBody/LineItemTypeRefresh';
import { updateSiteData, updateSite } from '../../../actions/siteActions';

export default connect(null, { updateSiteData, updateSite })(LineItemTypeRefresh);
