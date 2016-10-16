var React = window.React,
	Fluxxor = require('libs/third-party/fluxxor'),
	FluxMixin = Fluxxor.FluxMixin(React),
	CommonConsts = require('editor/commonConsts'),
	Menu = require('CustomComponents/menu/menu.jsx'),
	MenuItem = require('CustomComponents/menu/menuItem.jsx'),
	Info = require('./info.jsx'),
	CloseChannel = require('./close.jsx'),
	Misc = require('./misc.jsx'),
	IncontentJsSettings = require('./incontentJsSettings.jsx'),
	ApexIncontentSections = require('./apexIncontent.jsx');

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
			default:
				break;
		}
	},
	saveChannel: function(channelJson) {
		this.getFlux().actions.createChannel(channelJson);
	},
	saveSampleUrl: function(sampleUrl, useAlternateProxy, forceSampleUrl) {
		this.getFlux().actions.editSampleUrl(this.props.channel, sampleUrl, useAlternateProxy, forceSampleUrl);
	},
	closeChannel: function(saveChanges) {
		if (saveChanges) {
			this.getFlux().actions.saveChangesCloseChannel(this.props.channel);
		} else {
			this.getFlux().actions.discardChangesCloseChannel(this.props.channel);
		}
		this.getFlux().actions.hideAdRecoverPopup({visible: false});
	},
	deleteChannel: function() {
		this.getFlux().actions.deleteChannel(this.props.channel);
		this.getFlux().actions.hideAdRecoverPopup({visible: false});
	},
	onGlassClick: function() {
		this.getFlux().actions.hideMenu();
	},
	showCodeEditor: function(type) {
		if (type === 'beforeAp') {
			this.getFlux().actions.showComponent(CommonConsts.enums.components.CODE_EDITOR, 0, 0, {owner: 'channel', type: type, id: this.props.channel.id, code: this.props.channel.customJs.beforeAp});
		} else if (type === 'incontent') {
			this.getFlux().actions.showComponent(CommonConsts.enums.components.CODE_EDITOR, 0, 0, {owner: 'channel_incontent', type: type, id: this.props.channel.id, code: this.props.channel.incontentSettings.customJs});
		} else {
			this.getFlux().actions.showComponent(CommonConsts.enums.components.CODE_EDITOR, 0, 0, {owner: 'channel', type: type, id: this.props.channel.id, code: this.props.channel.customJs.afterAp});
		}
	},
	saveAutoAnalysisSettings: function(model) {
		if (model.hasOwnProperty('sizesAdded') && model.hasOwnProperty('sizesRemoved')) {
			this.getFlux().actions.createAction({
				name: CommonConsts.enums.actionManager.publicCommands.ADD_SIZES_TO_INCONTENT_SECTION,
				owner: CommonConsts.enums.actionManager.levels.INCONTENT_SECTION,
				audienceId: this.props.audiences[0].id,
				ownerId: this.props.channel.id,
				adSizes: model.sizesAdded
			});

			this.getFlux().actions.createAction({
				name: CommonConsts.enums.actionManager.publicCommands.REMOVE_SIZES_FROM_INCONTENT_SECTION,
				owner: CommonConsts.enums.actionManager.levels.INCONTENT_SECTION,
				audienceId: this.props.audiences[0].id,
				ownerId: this.props.channel.id,
				adSizes: model.sizesRemoved
			});

			// Delete ad sizes added/remove properties
			delete model.sizesAdded;
			delete model.sizesRemoved;
		}

		this.getFlux().actions.saveAutoAnalysisSettings(this.props.channel, model);
		this.getFlux().actions.hideMenu();
	},

	render: function() {
		return (
			<Menu onGlassClick={this.onGlassClick} targetX={this.props.position.posX} targetY={this.props.position.posY} activeItem={this.state.activeMenuItem}>
				<MenuItem icon="fa fa-clipboard" contentHeading="Page Group Info" contentComponent={<Info onSampleUrlChange={this.saveSampleUrl} channel={this.props.channel}/>}/>
				<MenuItem icon="fa fa-file-code-o" contentHeading="Custom Javascript" contentComponent={<Misc showCodeEditor={this.showCodeEditor} />}/>
				<MenuItem icon="fa fa-gear" contentHeading="In-content JS Settings"
					contentComponent={!this.props.apex ? <IncontentJsSettings flux={this.getFlux()}
						settings={this.props.inContentSettings}
						customSizes={this.props.customSizes}
						inContentAction={this.props.inContentAction}
						cmsInfo={this.props.cmsInfo}
						channel={this.props.channel}
						onSave={this.saveAutoAnalysisSettings}
					/> : <ApexIncontentSections channel={this.props.channel} apexIncontentSections={this.props.apexIncontentSections} adSizes={this.props.adSizes}/> }/>
				<MenuItem icon="fa fa-remove" contentHeading="Close Page Group" contentComponent={<CloseChannel onDeleteChannel={this.deleteChannel} onCloseChannel={this.closeChannel} />}/>
			</Menu>
		);
	}
});
