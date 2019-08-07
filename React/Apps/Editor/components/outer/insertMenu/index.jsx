import React, { PropTypes } from 'react';
import Menu from 'shared/menu/menu.jsx';
import MenuItem from 'shared/menu/menuItem.jsx';
import { commonSupportedSizes, nonPartnerAdSizes, adInsertOptions } from 'consts/commonConsts.js';
import AdSizeSelector from './adSizeSelector.jsx';
import ParentSelector from './parentSelector.jsx';
import { immutablePush } from 'libs/immutableHelpers';
import NetworkOptions from 'shared/networkOptions/NetworkOptions';

const initialState = {
		adSize: null,
		isCustomSize: false,
		operation: null,
		activeItem: 0,
		prevActiveItem: 0,
		showNetworkOptions: false
	},
	getInsertOptionClass = function(option) {
		switch (option) {
			case adInsertOptions.PREPEND:
				return 'ap-prepend';
			case adInsertOptions.INSERT_AFTER:
				return 'ap-insertafter';
			case adInsertOptions.INSERT_BEFORE:
				return 'ap-insertbefore';
			default:
				return 'ap-append';
		}
	};

class insertMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = initialState;
		this.createSectionAndAd = this.createSectionAndAd.bind(this);
		this.toggleNetworkOptions = this.toggleNetworkOptions.bind(this);
		this.networkOptionsSubmit = this.networkOptionsSubmit.bind(this);
	}

	componentWillMount() {
		currentUser.userType !== 'partner' ? this.enableNonPartnerAdSizes() : null;
	}

	componentWillReceiveProps() {
		this.setState(initialState);
	}

	setActiveItem(item) {
		this.setState({ activeItem: item, prevActiveItem: this.state.activeItem });
	}

	toggleNetworkOptions() {
		this.setState({
			showNetworkOptions: !this.state.showNetworkOptions,
			activeItem: this.state.prevActiveItem,
			prevActiveItem: this.state.activeItem
		});
	}

	selectSize(operation, adSize, isCustomSize = false) {
		this.setState({
			adSize,
			operation,
			isCustomSize,
			showNetworkOptions: true,
			activeItem: 0,
			prevActiveItem: this.state.activeItem
		});
	}

	createSectionAndAd(params) {
		let { position, adCode, firstFold, asyncTag, customZoneId, network, networkData } = params;
		const props = this.props;
		const { namingData } = props;
		const isMultipleAdSizes = !!(networkData.multipleAdSizes && networkData.multipleAdSizes.length);

		network = network ? network : 'custom';
		const sectionPayload = {
				position,
				firstFold: firstFold || false,
				asyncTag: asyncTag || false,
				xpath: props.parents[0].xpath,
				operation: this.state.operation,
				customZoneId: customZoneId || '',
				namingData: {
					...namingData,
					height: this.state.adSize.height,
					width: this.state.adSize.width
				}
			},
			adPayload = {
				isCustomSize: this.state.isCustomSize,
				network,
				height: this.state.adSize.height,
				width: this.state.adSize.width,
				networkData: {}
			};

		if (isMultipleAdSizes) {
			adPayload.multipleAdSizes = networkData.multipleAdSizes;
		}
		delete networkData.multipleAdSizes;
		delete networkData.isBackwardCompatibleSizes;

		adPayload.networkData = {
			...adPayload.networkData,
			...networkData
		};
		props.createSectionAndAd(sectionPayload, adPayload, props.variationId);
	}

	enableNonPartnerAdSizes() {
		commonSupportedSizes.forEach(size => {
			nonPartnerAdSizes.forEach(nPSize => {
				if (size.layoutType === nPSize.layoutType) {
					nPSize.sizes.forEach(s => {
						size.sizes.unshift(s);
					});
				}
			});
		});
	}

	networkOptionsSubmit(params) {
		this.createSectionAndAd(params);
	}

	render() {
		const props = this.props,
			isShowNetworkOptions = !!this.state.showNetworkOptions,
			isDefaultScreenValid = !!!isShowNetworkOptions,
			isLastScreenValid = !!isShowNetworkOptions;
		let items = [];
		if (!props.isVisible) {
			return null;
		}

		if (isDefaultScreenValid) {
			items = props.insertOptions.map((option, index) => (
				<MenuItem key={index} icon={getInsertOptionClass(option)} contentHeading={option}>
					<AdSizeSelector
						partner={props.partner}
						isCustomAdCodeInVariationAds={props.isCustomAdCodeInVariationAds}
						checked={option === this.state.operation ? this.state.adSize : null}
						adSizes={immutablePush(commonSupportedSizes, {
							layoutType: 'CUSTOM',
							sizes: props.customSizes
						})}
						insertOption={option}
						onCheckedItem={this.selectSize.bind(this, option)}
					/>
				</MenuItem>
			));
		} else if (isLastScreenValid) {
			items.push(
				<MenuItem key={1} icon="fa-sitemap" contentHeading="Network Options">
					<NetworkOptions
						firstFold={props.firstFold}
						onSubmit={this.networkOptionsSubmit}
						onCancel={this.toggleNetworkOptions}
						showNotification={this.props.showNotification}
						isInsertMode={true}
						primaryAdSize={this.state.adSize}
						zonesData={props.zonesData}
						networkConfig={props.networkConfig}
					/>
				</MenuItem>
			);
		}

		items.push(
			<MenuItem key={5} icon="fa-sitemap" contentHeading="Select Parent">
				<ParentSelector
					selectors={props.parents}
					channelId={this.props.channelId}
					onHighlightElement={props.highlightInnerElement}
					onSelectElement={props.selectInnerElement}
				/>
			</MenuItem>
		);

		return (
			<Menu
				id="insertMenu"
				position={Object.assign({}, this.props.position, { top: this.props.position.top + 43 })}
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
	isVisible: PropTypes.bool.isRequired,
	isCustomAdCodeInVariationAds: PropTypes.bool.isRequired,
	position: PropTypes.object,
	parents: PropTypes.array,
	customSizes: PropTypes.array,
	variationId: PropTypes.string,
	channelId: PropTypes.string,
	insertOptions: PropTypes.array,
	partner: PropTypes.string,
	createSectionAndAd: PropTypes.func,
	hideMenu: PropTypes.func,
	selectInnerElement: PropTypes.func,
	highlightInnerElement: PropTypes.func,
	showNotification: PropTypes.func
};

export default insertMenu;
