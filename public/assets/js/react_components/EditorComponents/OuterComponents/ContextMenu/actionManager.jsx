var React = window.React,
	CommonConsts = require("../../../../editor/commonConsts"),
	cmds = CommonConsts.enums.actionManager.publicCommands,
	levels = CommonConsts.enums.actionManager.levels,
	adsneseActions = CommonConsts.enums.actionManager.actions,
	actionStatus =  CommonConsts.enums.actionManager.status,
	$ = window.jQuery,
	_ = require("../../../../libs/third-party/underscore"),

	ActionCombiner = require("./actionCombiner"),
	ColorSwatch = require("../colorSwatch.jsx"),
    Panel = require("../../../BootstrapComponents/Panel.jsx"),
    Accordion = require("../../../BootstrapComponents/Accordion.jsx"),
    TabbedArea = require("../../../BootstrapComponents/TabbedArea.jsx"),
    TabPane = require("../../../BootstrapComponents/TabPane.jsx"),
	EnableDisableSwitch = require("../../../CustomComponents/EnableDisableSwitch.jsx"),

	Fluxxor =  require("../../../../libs/third-party/fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({

    mixins: [FluxMixin],

    changeAdTypeStatus: function(audienceId, sectionId, adType, status ) {
		this.getFlux().actions.createAction({
			name: cmds.CHANGE_ADSENSE_ADTYPE_STATUS,
			owner: levels.SECTION,
			adType: adType,
			ownerId: sectionId,
			audienceId: audienceId,
			status: (status ? actionStatus.APPEND : actionStatus.DISABLED)
		});
    },

    changeTemplateStatus: function(audienceId, sectionId, template, status ) {
		this.getFlux().actions.createAction({
			name: cmds.CHANGE_ADSENSE_COLOR_STATUS,
			owner: levels.SECTION,
			tpl: template,
			ownerId: sectionId,
			audienceId: audienceId,
			status: (status ? actionStatus.APPEND : actionStatus.DISABLED)
		});
    },

	render: function(){

		var actions = this.getFlux().store("ActionsStore").getSectionMergedActions(this.props.sectionId, this.props.activeChannelId),
			c = 0;

		var CombinedActions = function(actions){
			var adsenseActions = _(actions).where({ "key": "Adsense" });
			return ActionCombiner(adsenseActions[0].value);
		};

		var self = this;

		return (<div className="outer">
					{this.props.audiences.map(function(audience){
						return <TabbedArea>
									<TabPane tab={audience.name} eventKey={audience.id}>
										<Accordion className="panel-group-ap" defaultActiveKey="1">
											{ _(CombinedActions(actions[audience.id])).map(function(action, adType){
												return (<Panel className="panel-ap" header={adType} eventKey={ ++c } icon="arrows">
															<EnableDisableSwitch checked={action.status === actionStatus.APPEND} onChange={self.changeAdTypeStatus.bind(this, audience.id, self.props.sectionId, adType)} />;

															{action.templates ? action.templates.map(function(template){
																return [<ColorSwatch tpl={template.colorTemplate} />,
																		<EnableDisableSwitch checked={template.status === actionStatus.APPEND}  onChange={self.changeTemplateStatus.bind(this, audience.id, self.props.sectionId, template.colorTemplate)}  />];
															})	: null}

														</Panel>);
											})}
										</Accordion>
									</TabPane>
							</TabbedArea>;
					})}
				</div>);
	}
})