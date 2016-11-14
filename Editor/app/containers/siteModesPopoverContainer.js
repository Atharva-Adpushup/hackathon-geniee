import { connect } from 'react-redux';
import SiteModesPopover from 'misc/siteModesPopover.jsx';
import { getMode } from '../selectors/siteSelectors';
import { getSiteModesPopoverPosition, getSiteModesPopoverVisibility } from '../selectors/uiSelectors';
import { getSampleUrl } from 'selectors/channelSelectors';
import { changeMode } from 'actions/siteActions';
import { hideSiteModesPopover } from 'actions/uiActions';

const mapStateToProps = (state) => ({
		isVisible: getSiteModesPopoverVisibility(state),
		url: getSampleUrl(state),
		mode: getMode(state),
		position: getSiteModesPopoverPosition(state)
	}),

	mapDispatchToProps = (dispatch) => ({
		changeMode: (mode) => {
			dispatch(changeMode(mode));
		},
		showComponent: () => {},
		hideMenu: () => {
			dispatch(hideSiteModesPopover());
		}
	}),

	SiteModesPopoverContainer = connect(
		mapStateToProps,
		mapDispatchToProps
	)(SiteModesPopover);

export default SiteModesPopoverContainer;
