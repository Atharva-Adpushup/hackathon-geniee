import { connect } from 'react-redux';
import SiteModesPopover from 'misc/siteModesPopover.jsx';
import { getMode, getPartner } from '../selectors/siteSelectors';
import { getSiteModesPopoverPosition, getSiteModesPopoverVisibility } from '../selectors/uiSelectors';
import { getSampleUrl } from 'selectors/channelSelectors';
import { masterSaveData } from 'actions/siteActions';
import { hideSiteModesPopover } from 'actions/uiActions';

const mapStateToProps = state => ({
		isVisible: getSiteModesPopoverVisibility(state),
		url: getSampleUrl(state),
		mode: getMode(state),
		position: getSiteModesPopoverPosition(state),
		partner: getPartner(state)
	}),
	mapDispatchToProps = dispatch => ({
		masterSave: mode => {
			dispatch(masterSaveData(mode));
		},
		showComponent: () => {},
		hideMenu: () => {
			dispatch(hideSiteModesPopover());
		}
	}),
	SiteModesPopoverContainer = connect(mapStateToProps, mapDispatchToProps)(SiteModesPopover);

export default SiteModesPopoverContainer;
