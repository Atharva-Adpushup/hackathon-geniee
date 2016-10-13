var React = window.React,
    $ = window.jQuery,
    _ = require("../../../../libs/third-party/underscore"),
    CommonConsts =  require("../../../../editor/commonConsts"),
    cmds = CommonConsts.enums.actionManager.publicCommands,
    adSizes = CommonConsts.enums.adSizes,
    levels = CommonConsts.enums.actionManager.levels,
    adsneseActions = CommonConsts.enums.actionManager.actions

var Fluxxor =  require("../../../../libs/third-party/fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React);

var TabbedArea = require("../../../BootstrapComponents/TabbedArea.jsx"),
    TabPane = require("../../../BootstrapComponents/TabPane.jsx"),
    Panel = require("../../../BootstrapComponents/Panel.jsx"),
    Accordion = require("../../../BootstrapComponents/Accordion.jsx");

var AdTabs = React.createClass({

    getDefaultProps: function () {
        return {};
    },

    render: function () {
        var self = this;
        return (<TabbedArea>
					{_(this.props.adSizes).map(function (rec) {
                        return (<TabPane tab={rec.layoutType} eventKey={rec.layoutType}>
							{_(rec.sizes).map(function (adProps) {
                                return (<label>
                                    <input type="radio" name="adSize" value={[adProps.width, adProps.height]} onClick={self.props.onCheckedItem.bind(null, null)} />{adProps.width +" X "+ adProps.height}</label>)
                            })}
                        </TabPane>)
                    })}
        </TabbedArea>);
    }
});

module.exports = React.createClass({

    mixins: [FluxMixin],

    getInitialState: function () {
        return {activeKey: '1'}
    },

    setActivePanel: function (activeKey) {
        this.setState({activeKey: (activeKey || +this.state.activeKey + 1).toString()});
    },

    saveData: function (e) {
        e.preventDefault();

        var formData = _($(e.target).serializeArray()).groupBy("name"),
            adSize = formData.adSize[0].value.split(",");

        if (this.props.section) {
            this.getFlux().actions.createAction({
                name: cmds.ADD_SIZE_TO_SECTION,
                owner: levels.SECTION,
                ownerId: this.props.section.id,
                audienceId: parseInt(formData["audience"][0].value),
                adSize: {width:parseInt(adSize[0]),height:parseInt(adSize[1])}
            });
        }
        else
            this.getFlux().actions.addSection(this.props.selector, formData["adType"][0].value, {width:parseInt(adSize[0]),height:parseInt(adSize[1])}, formData["audience"][0].value);
    },

    render: function () {
        var insertOtions = "", value = "";
        if (!this.props.section) {
            insertOtions = this.props.insertOptions.map(function (option) {
                return (<li>
                    <input type="radio" id={option} name="adType" value={option}  onClick={this.setActivePanel.bind(null, null)} />
                    <label htmlFor={option}>{option}</label>
                </li>)
            }.bind(this));
            insertOtions = (<Panel className="panel-ap positionPanel" header="Position" eventKey='2' icon="arrows">
                <i className="fa fa-map-marker fa-map-se"></i>
                <ul>{insertOtions}</ul>
            </Panel>
            );
        }


        return (<div className="outer">
            <form onSubmit={this.saveData}>
                <Accordion className="panel-group-ap" defaultActiveKey="1" activePanel={this.state.activeKey}>
                    <Panel className="panel-ap" header="Sizes" eventKey='1' icon="arrows">
                        <i className="fa fa-arrows"></i>
                        <AdTabs adSizes={this.props.adSizes} onCheckedItem={this.setActivePanel} />
                    </Panel>
                  	{insertOtions}
                    <Panel className="panel-ap" header="Audiences" eventKey='3' icon="arrows">
                        <i className="fa fa-bullseye"></i>
								{this.props.audiences.map(function (audience) {
                                    return (<span>
                                        <input type="checkbox" name="audience" value={audience.id} /> {audience.name}</span>)
                                })}
                    </Panel>
                </Accordion>
                <input type="submit" />
            </form>
        </div>
        );
    }

});