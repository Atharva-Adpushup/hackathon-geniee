import React, { PropTypes } from 'react';
import Menu from 'shared/menu/menu.jsx';
import MenuItem from 'shared/menu/menuItem.jsx';
import { commonSupportedSizes } from 'consts/commonConsts.js';
import AdSizeSelector from './adSizeSelector.jsx';
import ParentSelector from './parentSelector.jsx';
import SectionOptions from './sectionOptions.jsx';

const initialState = {
		adSize: null,
		operation: null,
		activeItem: 0,
		prevActiveItem: 0,
		showExtraOptions: false
	},
	getInsertOptionClass = function (option) {
		switch (option) {
			case 'Prepend':
				return 'ap-prepend';
			case 'Insert After':
				return 'ap-insertafter';
			case 'Insert Before':
				return 'ap-insertbefore';
			default:
				return 'ap-append';
		}
	};

class insertMenu extends React.Component {
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

	toggleExtraOptions() {
		this.setState({ showExtraOptions: !this.state.showExtraOptions, activeItem: this.state.prevActiveItem, prevActiveItem: this.state.activeItem });
	}

	selectSize(operation, adSize) {
		this.setState({ adSize, operation, showExtraOptions: true, activeItem: 0, prevActiveItem: this.state.activeItem });
	}

	createSectionAndAd(position) {
		const sectionPayload = {
				position,
				name: 'Section 1',
				xpath: this.props.parents[0].xpath,
				operation: this.state.operation
			},
			adPayload = {
				height: this.state.adSize.height,
				width: this.state.adSize.width
			};
		this.props.createSectionAndAd(sectionPayload, adPayload, this.props.variationId);
	}

	render() {
		const props = this.props;
		let items = [];
		if (!props.isVisible) {
			return null;
		}

		if (!this.state.showExtraOptions) {
			items = props.insertOptions.map((option, index) => {
				return (
					<MenuItem key={index} icon={getInsertOptionClass(option)} contentHeading={option}>
						<AdSizeSelector
							checked={option === this.state.operation ? this.state.adSize : null}
							adSizes={commonSupportedSizes}
							insertOption={option}
							onCheckedItem={this.selectSize.bind(this, option)}
      />
					</MenuItem>);
			});
		} else {
			items.push((<MenuItem key={1} icon="fa-sitemap" contentHeading="Section Options">
				<SectionOptions onCreateAd={this.createSectionAndAd.bind(this)} onCancel={this.toggleExtraOptions.bind(this)} />
			</MenuItem>));
		}

		items.push((<MenuItem key={5} icon="fa-sitemap" contentHeading="Select Parent">
			<ParentSelector
				selectors={props.parents}
				channelId={this.props.channelId}
				onHighlightElement={props.highlightInnerElement}
				onSelectElement={props.selectInnerElement}
   />
		</MenuItem>));

		return (
			<Menu id="insertMenu"
				position={Object.assign({}, this.props.position, { top: this.props.position.top + 40 })}
				arrow="none"
				activeItem={this.state.activeItem}
				onMenuItemClick={this.setActiveItem.bind(this)}
				onGlassClick={props.hideMenu}
   >
				{items}
			</Menu>
		);
	}
}

insertMenu.propTypes = {
	position: PropTypes.object,
	parents: PropTypes.array,
	variationId: PropTypes.string,
	channelId: PropTypes.string,
	insertOptions: PropTypes.array,
	isVisible: PropTypes.bool.isRequired,
	createSectionAndAd: PropTypes.func,
	hideMenu: PropTypes.func,
	selectInnerElement: PropTypes.func,
	highlightInnerElement: PropTypes.func
};

export default insertMenu;
