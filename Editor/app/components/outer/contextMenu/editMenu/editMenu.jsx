import React, { PropTypes } from 'react';
import _ from 'lodash';
import Menu from 'shared/menu/menu.jsx';
import MenuItem from 'shared/menu/menuItem.jsx';
import { commonSupportedSizes } from 'consts/commonConsts.js';
import CssEditor from 'shared/cssEditor/cssEditor.jsx';

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

	setActiveItem(item) {
		this.setState({ activeItem: item, prevActiveItem: this.state.activeItem });
	}

	onCssEdit() {
		console.log(arguments);
	}

	handleSubmit(newCss) {
		console.log(newCss);
	}

	render() {
		const props = this.props;
		if (!props.isVisible) {
			return null;
		}

		return (
			<Menu id="editMenu" arrow="none" onGlassClick={props.hideMenu} position={props.position}>
				{
					_.map(props.section.ads, (ad, index) => {
						return (
							<MenuItem key={index} icon={'apSize'} text={`${ad.width} ${ad.height}`} contentHeading={`${ad.width} x ${ad.height}`}>
								<div> <CssEditor css={ad.css} onSave={this.handleSubmit} onCancel={this.onCssEdit.bind(this)} /> </div>
							</MenuItem>
						);
					})
				}

			</Menu>
		);
	}
}

editMenu.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	section: PropTypes.object,
	position: PropTypes.object,
	hideMenu: PropTypes.func
};

export default editMenu;

