import React, { PropTypes } from 'react';
import _ from 'lodash';
import Menu from 'shared/menu/menu.jsx';
import MenuItem from 'shared/menu/menuItem.jsx';
import AdDescriptor from 'containers/adDescripterContainer.js';

const initialState = {
	adSize: null,
	operation: null,
	activeItem: 0,
	prevActiveItem: 0,
	showExtraOptions: false
};

class editMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = initialState;
	}

	componentWillReceiveProps() {
		this.setState(initialState);
	}

	render() {
		const props = this.props;
		if (!props.isVisible) {
			return null;
		}

		return (
			<Menu
				id="editMenu"
				arrow="none"
				onGlassClick={props.hideMenu}
				position={Object.assign({}, props.position, { top: props.position.top + 43 })}
			>
				{_.map(props.section.ads, (ad, index) => (
					<MenuItem
						key={index}
						icon={'apSize'}
						text={`${ad.width} ${ad.height}`}
						contentHeading={`${ad.width} x ${ad.height}`}
					>
						<AdDescriptor
							variationId={props.variationId}
							ad={ad}
							section={props.section}
							updateSettings={props.updateSettings}
							onUpdateXPath={props.onUpdateXPath}
							onSectionAllXPaths={props.onSectionAllXPaths}
							onValidateXPath={props.onValidateXPath}
							onResetErrors={props.onResetErrors}
							showNotification={props.showNotification}
							updateAdSize={props.updateAdSize}
							channelId={props.channelId}
							networkConfig={props.networkConfig}
						/>
					</MenuItem>
				))}
			</Menu>
		);
	}
}

editMenu.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	section: PropTypes.object,
	position: PropTypes.object,
	hideMenu: PropTypes.func,
	updateSettings: PropTypes.func,
	showNotification: PropTypes.func
};

export default editMenu;
