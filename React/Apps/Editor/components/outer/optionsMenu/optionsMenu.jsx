var React = window.React,
	$ = window.jQuery,
	Fluxxor = require('libs/third-party/fluxxor'),
	FluxMixin = Fluxxor.FluxMixin(React),
	CommonConsts = require('editor/commonConsts'),
	cmds = CommonConsts.enums.actionManager.publicCommands,
	levels = CommonConsts.enums.actionManager.levels,
	availableActions = CommonConsts.enums.actionManager.actions,
	Menu = require('CustomComponents/menu/menu.jsx'),
	Button = require('BootstrapComponents/Button.jsx'),
	Modal = require('BootstrapComponents/Modal.jsx'),
	MenuItem = require('CustomComponents/menu/menuItem.jsx'),
	ControlConverter = require('./controlConverter.jsx'),
	ApSettings = require('./apSettings.jsx'),
	PluginPage = require('./pluginInstall.jsx'),
	Settings = require('SharedComonents/AdsenseSettings/settings.jsx'),
	Templates = require('SharedComonents/AdsenseSettings/templates.jsx'),
	AdTypes = require('SharedComonents/AdsenseSettings/adTypes.jsx'),
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx');

module.exports = React.createClass({
	mixins: [FluxMixin],

	getInitialState: function() {
		return {
			activeMenuItem: 0
		};
	},
	helpComponent: function(component) {
		switch (component) {
			case 'css':
				break;
		}
	},
	renderGuiderFinishMessage: function() {
		return (
			<Modal
				closeButton={false}
				onRequestHide={new Function()}
				title="loading"
				className="_ap_modal_logo"
				keyboard={true}
				animation={true}
			>
				<div className="spin" />
				<div className="modal-body">
					<h4>All Done</h4>
					<Button style={{ fontSize: 22 }} className="btn-lightBg" onClick={this.onGlassClick}>
						Let's Start!
					</Button>
				</div>
			</Modal>
		);
	},
	componentDidMount: function() {
		this.props.intro.goToStep(14);
		setTimeout(
			function() {
				$('#miscMenuIntroNext').on(
					'click',
					function() {
						// if ($('#intercom-launcher').length) {
						// 	this.props.intro.goToStep(15);
						// } else {
						// 	this.props.intro.exit();
						// }
						this.getFlux().actions.hideMenu();
					}.bind(this)
				);
			}.bind(this),
			1000
		);
	},
	onGlassClick: function() {
		this.getFlux().actions.hideMenu();
	},
	saveSettings: function(settings) {
		this.getFlux().actions.saveAdsenseSettings(settings);
	},
	saveTemplate: function(tpl) {
		if (tpl.id) {
			this.getFlux().actions.modifyAdsenseTemplate(tpl);
		} else {
			this.getFlux().actions.createAdsenseTemplate(tpl);
			this.getFlux().actions.createAction({
				name: cmds.ADD_ADSENSE_COLOR,
				owner: levels.SITE,
				ownerId: null,
				audienceId: this.props.audiences[0].id,
				tpl: this.getFlux()
					.store(CommonConsts.enums.stores.TPL_STORE)
					.getAdsenseTplByName(tpl.name)
			});
		}
		this.setState({ activeMenuItem: 1 });
	},
	saveAdtypes: function(adTypesNetworkWise) {
		this.getFlux().actions.createAction({
			name: cmds.CHANGE_ADTYPES_STATUS_NETWORKWISE,
			owner: levels.SITE,
			ownerId: null,
			audienceId: this.props.audiences[0].id,
			adTypesNetworkWise: adTypesNetworkWise
		});
		this.setState({ activeMenuItem: 2 });
	},
	saveColorStatus: function(tpls) {
		this.getFlux().actions.createAction({
			name: cmds.CHANGE_ADSENSE_COLORS_STATUS,
			owner: levels.SITE,
			ownerId: null,
			audienceId: this.props.audiences[0].id,
			tpls: tpls
		});
		this.setState({ activeMenuItem: 2 });
	},
	saveApSettings: function(configs) {
		this.getFlux().actions.saveApConfigs(configs);
		this.setState({ activeMenuItem: 4 });
	},
	hideMenu: function() {
		this.getFlux().actions.hideMenu();
	},

	menuHelp: function() {
		return (
			<div className="helpInsert">
				<Row>
					<Col xs={8}>
						<h5 className="helpHead">Select Size</h5>
						<p>Use this icon to select size of your choice dyhu</p>
					</Col>
					<Col xs={4}>
						<i className="fa fa-arrows" />
					</Col>
				</Row>
				<Row>
					<Col xs={8}>
						<h5 className="helpHead">Select Size</h5>
						<p>Use this icon to select size of your choice dyhu</p>
					</Col>
					<Col xs={4}>
						<i className="fa fa-arrows" />
					</Col>
				</Row>
				<Row>
					<Col xs={8}>
						<h5 className="helpHead">Select Size</h5>
						<p>Use this icon to select size of your choice dyhu</p>
					</Col>
					<Col xs={4}>
						<i className="fa fa-arrows" />
					</Col>
				</Row>
			</div>
		);
	},
	render: function() {
		var colorAction = this.props.action.getActionByKey(availableActions.ADSENSE_COLORS),
			adNetworkActions = this.getFlux()
				.store('ActionsStore')
				.getAdNetworkByOwner(levels.SITE);

		return (
			<Menu
				id="miscMenu"
				onGlassClick={this.onGlassClick}
				targetX={this.props.position.posX}
				targetY={this.props.position.posY}
				activeItem={this.state.activeMenuItem}
			>
				<MenuItem
					icon="fa fa-google"
					contentHeading="Adsense Configuration"
					contentComponent={
						<Settings
							noOfAds={this.props.adsense.maxAdsToDisplay}
							pubId={this.props.adsense.pubId}
							email={this.props.adsense.email}
							onSave={this.saveSettings}
						/>
					}
				/>
				<MenuItem
					icon="fa fa-eyedropper"
					contentHeading="Adsense Color Templates"
					contentComponent={
						<Templates
							flux={this.getFlux()}
							onSaveStatus={this.saveColorStatus}
							onNewTemplate={this.saveTemplate}
							action={colorAction}
						/>
					}
				/>
				<MenuItem
					icon="fa fa-cog"
					contentHeading="AdTypes Configuration"
					contentComponent={<AdTypes onSave={this.saveAdtypes} adNetworkActions={adNetworkActions} />}
				/>
				<MenuItem
					icon="fa fa-retweet"
					contentHeading="Convert Control"
					contentComponent={<ControlConverter />}
				/>
				<MenuItem
					icon="fa fa-cogs"
					contentHeading="Optimization Settings"
					contentComponent={
						<ApSettings
							isApex={this.props.apex}
							allChannels={this.props.allChannels}
							hideMenu={this.hideMenu}
							onSave={this.saveApSettings}
							apConfigs={this.props.apConfigs}
						/>
					}
				/>
				<MenuItem
					icon="fa fa-sliders"
					contentHeading="Tools"
					contentComponent={<PluginPage flux={this.getFlux()} />}
				/>
				{/*<MenuItem icon="fa-question" contentComponent={this.menuHelp()}/>*/}
			</Menu>
		);
	}
});
