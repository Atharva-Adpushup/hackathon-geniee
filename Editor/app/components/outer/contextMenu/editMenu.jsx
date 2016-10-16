let React = window.React,
	$ = window.jQuery,
	_ = require('libs/third-party/underscore'),
	CommonConsts = require('editor/commonConsts'),
	cmds = CommonConsts.enums.actionManager.publicCommands,
	levels = CommonConsts.enums.actionManager.levels,
	availableActions = CommonConsts.enums.actionManager.actions,

	Menu = require('CustomComponents/menu/menu.jsx'),
	MenuItem = require('CustomComponents/menu/menuItem.jsx'),
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx'),
	CSSEditor = require('./editMenu/cssEditor.jsx'),
	AdTypes = require('SharedComonents/AdsenseSettings/adTypes.jsx'),
	Templates = require('SharedComonents/AdsenseSettings/templates.jsx'),
	AdSizeSelector = require('./adSizeSelector.jsx'),
	AdsBySize = require('./editMenu/adsBySize.jsx'),
	Fluxxor = require('libs/third-party/fluxxor'),
	EditMisc = require('./editMenu/misc.jsx'),
	CodeBox = require('./codeBox.jsx'),
	FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({

	mixins: [FluxMixin],

	getInitialState () {
		let action = this.getFlux().store('ActionsStore').getActionBykey(levels.SECTION, this.props.section.id, this.props.audiences[0].id, availableActions.SIZES),
			sectionSizes = _(action.value).map((props) => {
				return props.data;
			}),
			ads = this.props.section.toJSON(this.getFlux()).ads, // Default audience ads
			menuItemIndex, 
self = this;

		// Iterate over all section sizes, set current object index to menu index
		// and match iterator object with ad size object
		_(sectionSizes).every((val, idx) => {
			menuItemIndex = idx;
			return !(_.isEqual(val, self.props.adSize));
		});

		return {
			ads,
			action,
			activeMenuItem: menuItemIndex,
			activeAd: null,
			sectionSizes,
			cssErrorMessage: null
		};
	},
	highLightAd (ad) {
		this.state.activeAd = ad;
		this.getFlux().actions.highLightAdBox({ sectionId: this.props.section.id, audienceId: this.props.audienceId, width: ad.width, height: ad.height });
	},
	deActivateAd () {
		// this.setState({ activeAd: null, activeMenuItem: this.state.sectionSizes.length + 1, cssErrorMessage: null });
	},
	insertAnotherSize (adProps) {
		this.getFlux().actions.createAction({
			name: cmds.ADD_SIZE_TO_SECTION,
			owner: levels.SECTION,
			ownerId: this.props.section.id,
			audienceId: this.props.audienceId,
			adSize: adProps
		});
	},
	removeAd (ad) {
		this.getFlux().actions.removeSizeFromSection({
			name: cmds.REMOVE_SIZE_FROM_SECTION,
			owner: levels.SECTION,
			ownerId: this.props.section.id,
			audienceId: this.props.audienceId,
			size: ad
		});
	},
	cssHandler (size, data) {
		this.getFlux().actions.createAction({
			name: cmds.ADD_CSS_TO_SIZE,
			owner: levels.SECTION,
			ownerId: this.props.section.id,
			audienceId: this.props.audienceId,
			adSize: size,
			css: data
		});
	},
	cssClickHandler (props) {
		this.setState({ activeAd: props, activeMenuItem: this.props.apex ? 1 : this.state.sectionSizes.length + 1 });
	},
	helpComponent (component) {
		switch (component) {
			case 'css':
				if (this.state.cssErrorMessage) {
					return (<div>{this.state.cssErrorMessage}</div>);
				}
				return null;
			default:
				return null;
		}
	},
	componentDidMount () {
		this.props.intro.goToStep(10);
		setTimeout(() => {
			$('#editMenuIntroNext').on('click', function () {
				this.props.intro.goToStep(11);
				this.getFlux().actions.hideMenu();
			}.bind(this));
		}, 1000);
	},
	handleCssError (error) {
		this.setState({ cssErrorMessage: error });
	},
	onGlassClick () {
		this.getFlux().actions.hideMenu();
	},
	saveAdtypes (adTypesNetworkWise) {
		this.getFlux().actions.createAction({
			name: cmds.CHANGE_ADTYPES_STATUS_NETWORKWISE,
			owner: levels.SECTION,
			ownerId: this.props.section.id,
			audienceId: this.props.audienceId,
			adTypesNetworkWise
		});
	},
	saveColorStatus (tpls) {
		this.getFlux().actions.createAction({
			name: cmds.CHANGE_ADSENSE_COLORS_STATUS,
			owner: levels.SECTION,
			ownerId: this.props.section.id,
			audienceId: this.props.audienceId,
			tpls
		});
	},
	saveTemplate (tpl) {
		if (tpl.id) {
			this.getFlux().actions.modifyAdsenseTemplate(tpl);
		} else {
			this.getFlux().actions.createAdsenseTemplate(tpl);
			this.getFlux().actions.createAction({
				name: cmds.ADD_ADSENSE_COLOR,
				owner: levels.SECTION,
				ownerId: this.props.section.id,
				audienceId: this.props.audienceId,
				tpl: this.getFlux().store('ColorTemplateStore').getAdsenseTplByName(tpl.name)
			});
		}
		this.setState({ activeMenuItem: 1 });
	},
	onActiveMenuChange (item) {
		this.setState({ activeMenuItem: item });
	},
	onCodeBoxSave (adCode) {
		this.getFlux().actions.updateSection({ id: this.props.section.id, adCode });
		this.getFlux().actions.hideMenu();
	},
	renderWithApex () {
		let self = this, 
items = [];

		items = _(this.state.action.value).map((props) => {
			return (
				<MenuItem
					icon={'apSize'}
					text={`${props.data.width  } ${  props.data.height}`}
					contentExt={null}
					onActive={self.highLightAd.bind(null, props.data)}
					contentComponent={<CodeBox onSave={self.onCodeBoxSave} onDelete={self.removeAd.bind(null, props.data)} code={self.props.section.adCode} />}
					contentHeading={`${props.data.width  } x ${  props.data.height}`}
    />
			);
		});

		items.push((<MenuItem contentExt={this.helpComponent('css')} onActive={self.deActivateAd} icon="btn-edit-css" contentComponent={<CSSEditor errorHandler={this.handleCssError} cssHandler={this.cssHandler} adSizes={this.state.sectionSizes} activeAd={this.state.activeAd} />} contentHeading="Edit Css" />));
		return items;
	},
	renderWithoutApex () {
		let self = this, 
colorAction = null, 
insertedSizes, 
items,
			adNetworkActions = this.getFlux().store('ActionsStore').getMergedAdNetworkBySection(this.props.section.id, this.props.section.channelId),
			adsenseAction = _(adNetworkActions).findWhere({ key: availableActions.ADSENSE });
		if (adsenseAction) {
			colorAction = adsenseAction.getActionByKey(availableActions.ADSENSE_COLORS);
		}

		// adTypesAction = this.props.action.getActionByKey(availableActions.ADSENSE_ADTYPES);
		insertedSizes = _(this.state.action.value).pluck('data');
		items = _(this.state.action.value).map((props) => {
			let adsBySize = _(self.state.ads).filter({ height: props.data.height, width: props.data.width });
			return (
				<MenuItem
					icon={'apSize'}
					text={`${props.data.width  } ${  props.data.height}`}
					contentExt={null}
					onActive={self.highLightAd.bind(null, props.data)}
					contentComponent={<AdsBySize
						removeAdClickHandler={self.removeAd.bind(null, props.data)}
						cssClickHandler={self.cssClickHandler.bind(null, props.data)}
						ads={adsBySize}
						size={{ height: props.data.height, width: props.data.width }}
     />}
					contentHeading={`${props.data.width  } x ${  props.data.height}`}
    />
			);
		});

		items.push(<MenuItem icon="fa-plus" contentComponent={<AdSizeSelector flux={this.getFlux()} blockedSizes={insertedSizes} adSizes={this.props.adSizes} onCheckedItem={this.insertAnotherSize} />} contentHeading="Insert Another Size" />);
		items.push((<MenuItem contentExt={this.helpComponent('css')} onActive={self.deActivateAd} icon="btn-edit-css" contentComponent={<CSSEditor errorHandler={this.handleCssError} cssHandler={this.cssHandler} adSizes={this.state.sectionSizes} activeAd={this.state.activeAd} />} contentHeading="Edit Css" />));
		if (colorAction) {
			items.push(<MenuItem icon="fa fa-eyedropper" contentHeading="Adsense Color Templates" contentComponent={<Templates flux={this.getFlux()} onSaveStatus={this.saveColorStatus} onNewTemplate={this.saveTemplate} action={colorAction} />} />);
		}
		items.push(<MenuItem icon="fa fa-cog" contentHeading="AdTypes Configuration" contentComponent={<AdTypes onSave={this.saveAdtypes} adNetworkActions={adNetworkActions} />} />);
		return items;
	},
	render () {
		let items = this.props.apex ? this.renderWithApex() : this.renderWithoutApex();
		items.push(<MenuItem icon="fa fa-sliders" contentHeading="Miscellaneous" contentComponent={<EditMisc section={this.props.section} flux={this.getFlux()} />} />);
		return (
			<Menu id="editMenu" arrow="none" onActiveMenuChange={this.onActiveMenuChange} onGlassClick={this.onGlassClick} targetX={this.props.position.posX} targetY={this.props.position.posY} activeItem={this.state.activeMenuItem}>
				{items}
			</Menu>
		);
	}
});
